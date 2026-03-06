const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const CODE_EXPIRE_MS = 5 * 60 * 1000;
const ADMIN_SESSION_MS = 2 * 60 * 60 * 1000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123";
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;

const rootDir = path.join(__dirname, "..");
const htmlDir = path.join(rootDir, "html");
const dbPath = path.join(rootDir, "data", "db.json");
const adminSessions = new Map();

app.use(express.json());
app.use(express.static(rootDir));

function loadDB() {
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

function getEmployee(db, employeeId) {
  return db.employees[employeeId];
}

function isLocked(employee) {
  if (!employee.security.lockedUntil) {
    return false;
  }
  if (Date.now() >= employee.security.lockedUntil) {
    employee.security.lockedUntil = 0;
    employee.security.failedAttempts = 0;
    return false;
  }
  return true;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
}

function createAdminSession(username) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + ADMIN_SESSION_MS;
  adminSessions.set(token, { username, expiresAt });
  return { token, expiresAt };
}

function getAdminToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return String(req.headers["x-admin-token"] || "").trim();
}

function requireAdmin(req, res) {
  const token = getAdminToken(req);
  if (!token) {
    res.status(401).json({ message: "管理员未登录或登录已失效。" });
    return false;
  }

  const session = adminSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    res.status(401).json({ message: "管理员会话已过期，请重新登录。" });
    return false;
  }

  req.adminUser = session.username;

  return true;
}

function ensureAdminStore(db) {
  if (!db.admins || typeof db.admins !== "object") {
    db.admins = {};
  }
}

function getStoredAdmin(db, username) {
  ensureAdminStore(db);
  return db.admins[username];
}

function getEmployeeSummary(employee) {
  const locked = Boolean(employee.security && employee.security.lockedUntil && Date.now() < employee.security.lockedUntil);
  return {
    employeeId: employee.employeeId,
    profile: employee.profile || {},
    security: {
      failedAttempts: employee.security ? employee.security.failedAttempts || 0 : 0,
      lockedUntil: employee.security ? employee.security.lockedUntil || 0 : 0,
      locked
    }
  };
}

app.post("/api/auth/login", (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim().toUpperCase();
  const password = String(req.body.password || "");

  const db = loadDB();
  const employee = getEmployee(db, employeeId);

  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({ message: "密码格式不正确，必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  if (isLocked(employee)) {
    saveDB(db);
    const remainMs = employee.security.lockedUntil - Date.now();
    const remainMin = Math.ceil(remainMs / 60000);
    return res.status(423).json({ message: `账号已锁定，请 ${remainMin} 分钟后重试。` });
  }

  if (employee.password !== password) {
    employee.security.failedAttempts += 1;
    if (employee.security.failedAttempts >= LOCK_THRESHOLD) {
      employee.security.lockedUntil = Date.now() + LOCK_DURATION_MS;
      employee.security.failedAttempts = 0;
      saveDB(db);
      return res.status(401).json({ message: "密码连续输错，账号已锁定 5 分钟。" });
    }
    const remain = LOCK_THRESHOLD - employee.security.failedAttempts;
    saveDB(db);
    return res.status(401).json({ message: `密码错误，还可尝试 ${remain} 次。` });
  }

  employee.security.failedAttempts = 0;
  employee.security.lockedUntil = 0;
  saveDB(db);

  return res.json({
    message: "登录成功",
    employee: {
      employeeId: employee.employeeId,
      profile: employee.profile,
      history: employee.history || []
    }
  });
});

app.post("/api/auth/send-code", (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim().toUpperCase();
  const method = req.body.method === "email" ? "email" : "sms";

  const db = loadDB();
  const employee = getEmployee(db, employeeId);
  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  employee.recovery.method = method;
  employee.recovery.code = code;
  employee.recovery.expiresAt = Date.now() + CODE_EXPIRE_MS;
  saveDB(db);

  const target = method === "sms" ? employee.profile.phone : employee.profile.email;
  return res.json({
    message: `验证码已发送至${target}（演示环境）。`,
    demoCode: code
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim().toUpperCase();
  const code = String(req.body.code || "").trim();
  const newPassword = String(req.body.newPassword || "");

  const db = loadDB();
  const employee = getEmployee(db, employeeId);
  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  if (!employee.recovery.code) {
    return res.status(400).json({ message: "请先发送验证码。" });
  }

  if (Date.now() > employee.recovery.expiresAt) {
    return res.status(400).json({ message: "验证码已过期，请重新发送。" });
  }

  if (employee.recovery.code !== code) {
    return res.status(400).json({ message: "验证码错误。" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "新密码长度至少 8 位。" });
  }

  if (!PASSWORD_RULE.test(newPassword)) {
    return res.status(400).json({ message: "新密码必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  if (!PASSWORD_RULE.test(newPassword)) {
    return res.status(400).json({ message: "新密码必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  employee.password = newPassword;
  employee.security.failedAttempts = 0;
  employee.security.lockedUntil = 0;
  employee.recovery.code = "";
  employee.recovery.expiresAt = 0;
  saveDB(db);

  return res.json({ message: "密码重置成功，请返回登录。" });
});

app.post("/api/auth/change-password", (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim().toUpperCase();
  const oldPassword = String(req.body.oldPassword || "");
  const newPassword = String(req.body.newPassword || "");

  const db = loadDB();
  const employee = getEmployee(db, employeeId);
  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  if (employee.password !== oldPassword) {
    return res.status(400).json({ message: "旧密码不正确。" });
  }

  if (!PASSWORD_RULE.test(oldPassword)) {
    return res.status(400).json({ message: "旧密码格式不正确，必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "新密码长度至少 8 位。" });
  }

  if (!PASSWORD_RULE.test(newPassword)) {
    return res.status(400).json({ message: "新密码必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  if (newPassword === oldPassword) {
    return res.status(400).json({ message: "新密码不能与旧密码相同。" });
  }

  employee.password = newPassword;
  saveDB(db);
  return res.json({ message: "密码修改成功。" });
});

app.get("/api/employees/:id/profile", (req, res) => {
  const employeeId = String(req.params.id || "").trim().toUpperCase();
  const db = loadDB();
  const employee = getEmployee(db, employeeId);
  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  return res.json({
    profile: employee.profile,
    history: employee.history || []
  });
});

app.put("/api/employees/:id/profile", (req, res) => {
  const employeeId = String(req.params.id || "").trim().toUpperCase();
  const db = loadDB();
  const employee = getEmployee(db, employeeId);
  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  const nextProfile = {
    phone: String(req.body.phone || "").trim(),
    email: String(req.body.email || "").trim(),
    department: String(req.body.department || "").trim(),
    position: String(req.body.position || "").trim()
  };

  const oldProfile = employee.profile || {};
  const fieldLabel = {
    phone: "手机号",
    email: "邮箱",
    department: "所属部门",
    position: "岗位"
  };

  const changedRecords = [];
  Object.keys(nextProfile).forEach((key) => {
    if ((oldProfile[key] || "") !== nextProfile[key]) {
      changedRecords.push({
        time: formatTime(Date.now()),
        field: fieldLabel[key],
        oldValue: oldProfile[key] || "-",
        newValue: nextProfile[key] || "-"
      });
    }
  });

  employee.profile = nextProfile;
  if (changedRecords.length > 0) {
    employee.history = changedRecords.concat(employee.history || []);
  }

  saveDB(db);

  return res.json({
    message: changedRecords.length > 0 ? "信息已保存并同步到后端数据库。" : "未检测到信息变更，已保持原数据。",
    history: employee.history || []
  });
});

app.post("/api/auth/register", (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim().toUpperCase();
  const password = String(req.body.password || "");

  if (!/^E\d{4,}$/.test(employeeId)) {
    return res.status(400).json({ message: "工号格式不正确，应为 E+数字（如 E1002）。" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "密码至少 8 位。" });
  }

  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({ message: "密码必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  const db = loadDB();
  if (db.employees[employeeId]) {
    return res.status(409).json({ message: "工号已存在。" });
  }

  db.employees[employeeId] = {
    employeeId,
    password,
    profile: {
      phone: "",
      email: "",
      department: "",
      position: ""
    },
    security: {
      failedAttempts: 0,
      lockedUntil: 0
    },
    recovery: {
      method: "",
      code: "",
      expiresAt: 0
    },
    history: []
  };

  saveDB(db);
  return res.json({ message: "注册成功，请返回登录。" });
});

app.post("/api/admin/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const db = loadDB();
  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({ message: "密码格式不正确，必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  const storedAdmin = getStoredAdmin(db, username);
  const matchedDefault = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  const matchedStored = Boolean(storedAdmin && storedAdmin.password === password);

  if (!matchedDefault && !matchedStored) {
    return res.status(401).json({ message: "管理员账号或密码错误。" });
  }

  const session = createAdminSession(username);
  return res.json({
    message: "管理员登录成功。",
    token: session.token,
    expiresAt: session.expiresAt
  });
});

app.post("/api/admin/register", (req, res) => {
  const username = String(req.body.username || "").trim().toUpperCase();
  const password = String(req.body.password || "");

  if (!/^A\d{4,}$/.test(username)) {
    return res.status(400).json({ message: "管理员账号格式不正确，应为 A+数字（如 A1001）。" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "管理员密码至少 8 位。" });
  }

  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({ message: "管理员密码必须同时包含字母和数字，且只能包含字母和数字。" });
  }

  if (username === ADMIN_USERNAME) {
    return res.status(409).json({ message: "该管理员账号已保留，请使用其他账号。" });
  }

  const db = loadDB();
  ensureAdminStore(db);
  if (db.admins[username]) {
    return res.status(409).json({ message: "管理员账号已存在。" });
  }

  db.admins[username] = {
    username,
    password,
    createdAt: Date.now()
  };
  saveDB(db);

  return res.json({ message: "管理员注册成功，请登录管理端。" });
});

app.get("/api/admin/employees", (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  const db = loadDB();
  const employees = Object.keys(db.employees)
    .sort()
    .map((employeeId) => getEmployeeSummary(db.employees[employeeId]));

  return res.json({ employees });
});

app.post("/api/admin/employees/:id/unlock", (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  const employeeId = String(req.params.id || "").trim().toUpperCase();
  const db = loadDB();
  const employee = getEmployee(db, employeeId);

  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  employee.security.failedAttempts = 0;
  employee.security.lockedUntil = 0;
  saveDB(db);

  return res.json({
    message: `工号 ${employeeId} 已解除锁定。`,
    employee: getEmployeeSummary(employee)
  });
});

app.post("/api/admin/employees/:id/reset-password", (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  const employeeId = String(req.params.id || "").trim().toUpperCase();
  const newPassword = String(req.body.newPassword || "");
  const db = loadDB();
  const employee = getEmployee(db, employeeId);

  if (!employee) {
    return res.status(404).json({ message: "工号不存在。" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "新密码长度至少 8 位。" });
  }

  employee.password = newPassword;
  employee.security.failedAttempts = 0;
  employee.security.lockedUntil = 0;
  saveDB(db);

  return res.json({
    message: `工号 ${employeeId} 密码已重置。`,
    employee: getEmployeeSummary(employee)
  });
});

app.post("/api/contact", (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) {
    return res.status(400).json({ message: "留言不能为空。" });
  }
  return res.json({ message: "留言已收到，我们会尽快联系你。" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(htmlDir, "index.html"));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT} (accessible from network)`);
});
