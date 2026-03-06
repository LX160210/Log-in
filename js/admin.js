(function () {
    const ADMIN_TOKEN_KEY = "admin_session_token_v1";
    const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;

    const adminLoginCard = document.getElementById("adminLoginCard");
    const adminPanel = document.getElementById("adminPanel");

    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminRegisterForm = document.getElementById("adminRegisterForm");
    const adminUsernameInput = document.getElementById("adminUsername");
    const adminPasswordInput = document.getElementById("adminPassword");
    const adminRegisterUsernameInput = document.getElementById("adminRegisterUsername");
    const adminRegisterPasswordInput = document.getElementById("adminRegisterPassword");

    const adminLoginMessage = document.getElementById("adminLoginMessage");
    const adminRegisterMessage = document.getElementById("adminRegisterMessage");
    const adminActionMessage = document.getElementById("adminActionMessage");

    const adminLogoutBtn = document.getElementById("adminLogoutBtn");
    const refreshEmployeesBtn = document.getElementById("refreshEmployeesBtn");
    const resetPasswordInput = document.getElementById("resetPasswordInput");
    const tableBody = document.getElementById("employeeAdminTableBody");

    if (!adminLoginForm || !adminRegisterForm || !tableBody) {
        return;
    }

    function getToken() {
        return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
    }

    function setToken(token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }

    function clearToken() {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }

    function setMessage(el, text) {
        el.textContent = text || "";
    }

    function showLogin() {
        adminLoginCard.classList.remove("hidden");
        adminPanel.classList.add("hidden");
    }

    function showPanel() {
        adminLoginCard.classList.add("hidden");
        adminPanel.classList.remove("hidden");
    }

    async function requestAdminJSON(url, options) {
        const token = getToken();
        const nextOptions = options || {};
        const nextHeaders = Object.assign({}, nextOptions.headers || {});

        if (token) {
            nextHeaders.Authorization = "Bearer " + token;
        }

        nextOptions.headers = nextHeaders;
        const response = await fetch(url, nextOptions);
        const data = await response.json().catch(function () {
            return { message: "服务器返回异常。" };
        });

        if (!response.ok) {
            throw new Error(data.message || "请求失败");
        }

        return data;
    }

    function renderRows(employees) {
        tableBody.innerHTML = "";

        if (!employees || employees.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='6'>暂无员工数据</td>";
            tableBody.appendChild(row);
            return;
        }

        employees.forEach(function (employee) {
            const row = document.createElement("tr");
            const locked = Boolean(employee.security && employee.security.locked);
            const department = employee.profile && employee.profile.department ? employee.profile.department : "-";
            const position = employee.profile && employee.profile.position ? employee.profile.position : "-";
            const failedAttempts = employee.security ? employee.security.failedAttempts || 0 : 0;

            const statusText = locked ? "已锁定" : "正常";
            const statusClass = locked ? "status-pill locked" : "status-pill ok";

            row.innerHTML =
                "<td>" + employee.employeeId + "</td>" +
                "<td>" + department + "</td>" +
                "<td>" + position + "</td>" +
                "<td><span class='" + statusClass + "'>" + statusText + "</span></td>" +
                "<td>" + failedAttempts + "</td>" +
                "<td>" +
                "<button class='action-btn' data-action='unlock' data-id='" + employee.employeeId + "'>解除锁定</button> " +
                "<button class='action-btn warn' data-action='reset' data-id='" + employee.employeeId + "'>重置密码</button>" +
                "</td>";

            tableBody.appendChild(row);
        });
    }

    async function loadEmployees() {
        const data = await requestAdminJSON("/api/admin/employees", { method: "GET" });
        renderRows(data.employees || []);
    }

    adminLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setMessage(adminLoginMessage, "");
        setMessage(adminRegisterMessage, "");

        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value;

        try {
            const data = await requestAdminJSON("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });
            setToken(data.token || "");
            adminLoginForm.reset();
            showPanel();
            setMessage(adminActionMessage, "管理员登录成功。已加载员工列表。");
            await loadEmployees();
        } catch (error) {
            setMessage(adminLoginMessage, error.message);
        }
    });

    adminRegisterForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setMessage(adminRegisterMessage, "");
        setMessage(adminLoginMessage, "");

        const username = adminRegisterUsernameInput.value.trim().toUpperCase();
        const password = adminRegisterPasswordInput.value;

        try {
            const data = await requestAdminJSON("/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });
            adminRegisterForm.reset();
            adminUsernameInput.value = username;
            setMessage(adminRegisterMessage, data.message);
        } catch (error) {
            setMessage(adminRegisterMessage, error.message);
        }
    });

    adminLogoutBtn.addEventListener("click", function () {
        clearToken();
        showLogin();
        setMessage(adminLoginMessage, "已退出管理员登录。");
        setMessage(adminActionMessage, "");
        tableBody.innerHTML = "";
    });

    refreshEmployeesBtn.addEventListener("click", async function () {
        try {
            await loadEmployees();
            setMessage(adminActionMessage, "员工列表已刷新。");
        } catch (error) {
            setMessage(adminActionMessage, error.message);
            if (error.message.indexOf("会话") >= 0 || error.message.indexOf("未登录") >= 0) {
                clearToken();
                showLogin();
            }
        }
    });

    tableBody.addEventListener("click", async function (event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const action = target.getAttribute("data-action");
        const employeeId = target.getAttribute("data-id");
        if (!action || !employeeId) {
            return;
        }

        setMessage(adminActionMessage, "");

        try {
            if (action === "unlock") {
                const data = await requestAdminJSON("/api/admin/employees/" + employeeId + "/unlock", {
                    method: "POST"
                });
                setMessage(adminActionMessage, data.message);
            }

            if (action === "reset") {
                const newPassword = (resetPasswordInput.value || "").trim();
                if (newPassword.length < 8) {
                    throw new Error("请先在上方输入至少 8 位的新密码，再执行重置。");
                }

                if (!PASSWORD_RULE.test(newPassword)) {
                    throw new Error("新密码必须同时包含字母和数字，且只能包含字母和数字。");
                }

                const data = await requestAdminJSON("/api/admin/employees/" + employeeId + "/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPassword: newPassword })
                });
                setMessage(adminActionMessage, data.message);
            }

            await loadEmployees();
        } catch (error) {
            setMessage(adminActionMessage, error.message);
            if (error.message.indexOf("会话") >= 0 || error.message.indexOf("未登录") >= 0) {
                clearToken();
                showLogin();
            }
        }
    });

    async function bootstrap() {
        const token = getToken();
        if (!token) {
            showLogin();
            return;
        }

        try {
            showPanel();
            await loadEmployees();
        } catch (error) {
            clearToken();
            showLogin();
            setMessage(adminLoginMessage, "管理员会话已失效，请重新登录。");
        }
    }

    bootstrap();
})();
