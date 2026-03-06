(function () {
    const SESSION_KEY = "employee_session_v2";

    const authCard = document.getElementById("authCard");
    const registerCard = document.getElementById("registerCard");
    const forgotCard = document.getElementById("forgotCard");
    const dashboard = document.getElementById("dashboard");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegisterBtn = document.getElementById("showRegister");
    const cancelRegisterBtn = document.getElementById("cancelRegister");
    const showForgotBtn = document.getElementById("showForgotBtn");
    const backToLoginBtn = document.getElementById("backToLoginBtn");
    const forgotForm = document.getElementById("forgotForm");
    const sendCodeBtn = document.getElementById("sendCodeBtn");
    const changePwdForm = document.getElementById("changePwdForm");
    const profileForm = document.getElementById("profileForm");
    const logoutBtn = document.getElementById("logoutBtn");

    const authMessage = document.getElementById("authMessage");
    const registerMessage = document.getElementById("registerMessage");
    const forgotMessage = document.getElementById("forgotMessage");
    const changePwdMessage = document.getElementById("changePwdMessage");
    const profileMessage = document.getElementById("profileMessage");

    const welcomeText = document.getElementById("welcomeText");
    const historyBody = document.getElementById("historyBody");

    const employeeIdInput = document.getElementById("employeeId");
    const loginPasswordInput = document.getElementById("loginPassword");
    const registerEmployeeIdInput = document.getElementById("registerEmployeeId");

    const recoverEmployeeIdInput = document.getElementById("recoverEmployeeId");
    const verifyCodeInput = document.getElementById("verifyCode");
    const newPasswordInput = document.getElementById("newPassword");
    const registerPasswordInput = document.getElementById("registerPassword");

    const oldPasswordInput = document.getElementById("oldPassword");
    const updatedPasswordInput = document.getElementById("updatedPassword");


    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const departmentInput = document.getElementById("department");
    const positionInput = document.getElementById("position");

    if (!loginForm || !registerForm || !showRegisterBtn || !cancelRegisterBtn) {
        return;
    }

    function getSession() {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function setSession(employeeId) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ employeeId: employeeId }));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    async function requestJSON(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return { message: "服务器返回异常。" };
        });
        if (!response.ok) {
            throw new Error(data.message || "请求失败");
        }
        return data;
    }

    function showLoginPanel() {
        authCard.classList.remove("hidden");
        forgotCard.classList.add("hidden");
        dashboard.classList.add("hidden");
        registerCard.classList.add("hidden");
    }

    function showForgotPanel() {
        authCard.classList.add("hidden");
        forgotCard.classList.remove("hidden");
        dashboard.classList.add("hidden");
        registerCard.classList.add("hidden");
    }

    function showRegisterPanel() {
        authCard.classList.add("hidden");
        forgotCard.classList.add("hidden");
        dashboard.classList.add("hidden");
        registerCard.classList.remove("hidden");
    }

    function showDashboard(employeeId, profile, history) {
        authCard.classList.add("hidden");
        forgotCard.classList.add("hidden");
        dashboard.classList.remove("hidden");
        registerCard.classList.add("hidden");
        welcomeText.textContent = "当前登录工号：" + employeeId;
        fillProfile(profile || {});
        renderHistory(history || []);
    }

    function fillProfile(profile) {
        phoneInput.value = profile.phone || "";
        emailInput.value = profile.email || "";
        departmentInput.value = profile.department || "";
        positionInput.value = profile.position || "";
    }

    function renderHistory(records) {
        historyBody.innerHTML = "";
        if (!records || records.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='4'>暂无修改记录</td>";
            historyBody.appendChild(row);
            return;
        }

        records.slice(0, 50).forEach(function (item) {
            const row = document.createElement("tr");
            row.innerHTML =
                "<td>" + item.time + "</td>" +
                "<td>" + item.field + "</td>" +
                "<td>" + item.oldValue + "</td>" +
                "<td>" + item.newValue + "</td>";
            historyBody.appendChild(row);
        });
    }

    function clearMessages() {
        authMessage.textContent = "";
        registerMessage.textContent = "";
        forgotMessage.textContent = "";
        changePwdMessage.textContent = "";
        profileMessage.textContent = "";
    }

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearMessages();

        const employeeId = registerEmployeeIdInput.value.trim().toUpperCase();
        const password = registerPasswordInput.value;

        try {
            const data = await requestJSON("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: employeeId, password: password })
            });
            registerMessage.textContent = data.message;
            registerForm.reset();
        } catch (error) {
            registerMessage.textContent = error.message;
        }
    });

    async function refreshProfile(employeeId) {
        const data = await requestJSON("/api/employees/" + employeeId + "/profile");
        showDashboard(employeeId, data.profile, data.history || []);
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearMessages();

        const employeeId = employeeIdInput.value.trim().toUpperCase();
        const password = loginPasswordInput.value;

        try {
            const data = await requestJSON("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: employeeId, password: password })
            });
            setSession(employeeId);
            showDashboard(employeeId, data.employee.profile, data.employee.history || []);
        } catch (error) {
            authMessage.textContent = error.message;
        }
    });

    showForgotBtn.addEventListener("click", function () {
        clearMessages();
        showForgotPanel();
    });

    showRegisterBtn.addEventListener("click", function () {
        clearMessages();
        showRegisterPanel();
    });

    cancelRegisterBtn.addEventListener("click", function () {
        clearMessages();
        showLoginPanel();
    });

    backToLoginBtn.addEventListener("click", function () {
        clearMessages();
        showLoginPanel();
    });

    sendCodeBtn.addEventListener("click", async function () {
        clearMessages();

        const employeeId = recoverEmployeeIdInput.value.trim().toUpperCase();
        const methodNode = document.querySelector("input[name='recoverMethod']:checked");
        const method = methodNode ? methodNode.value : "sms";

        try {
            const data = await requestJSON("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: employeeId, method: method })
            });
            forgotMessage.textContent = data.message;
            alert("演示验证码：" + data.demoCode);
        } catch (error) {
            forgotMessage.textContent = error.message;
        }
    });

    forgotForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearMessages();

        const employeeId = recoverEmployeeIdInput.value.trim().toUpperCase();
        const code = verifyCodeInput.value.trim();
        const newPassword = newPasswordInput.value;

        try {
            const data = await requestJSON("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: employeeId, code: code, newPassword: newPassword })
            });
            forgotForm.reset();
            forgotMessage.textContent = data.message;
        } catch (error) {
            forgotMessage.textContent = error.message;
        }
    });

    changePwdForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearMessages();

        const session = getSession();
        if (!session || !session.employeeId) {
            changePwdMessage.textContent = "登录已失效，请重新登录。";
            showLoginPanel();
            return;
        }

        const oldPassword = oldPasswordInput.value;
        const updatedPassword = updatedPasswordInput.value;

        try {
            const data = await requestJSON("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: session.employeeId,
                    oldPassword: oldPassword,
                    newPassword: updatedPassword
                })
            });
            changePwdForm.reset();
            changePwdMessage.textContent = data.message;
        } catch (error) {
            changePwdMessage.textContent = error.message;
        }
    });

    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearMessages();

        const session = getSession();
        if (!session || !session.employeeId) {
            profileMessage.textContent = "登录已失效，请重新登录。";
            showLoginPanel();
            return;
        }

        const newProfile = {
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            department: departmentInput.value.trim(),
            position: positionInput.value.trim()
        };

        try {
            const data = await requestJSON("/api/employees/" + session.employeeId + "/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProfile)
            });
            profileMessage.textContent = data.message;
            renderHistory(data.history || []);
        } catch (error) {
            profileMessage.textContent = error.message;
        }
    });

    logoutBtn.addEventListener("click", function () {
        clearSession();
        clearMessages();
        showLoginPanel();
        loginForm.reset();
        changePwdForm.reset();
        profileForm.reset();
        authMessage.textContent = "已安全退出。";
    });

    async function bootstrap() {
        const session = getSession();
        if (!session || !session.employeeId) {
            showLoginPanel();
            return;
        }

        try {
            await refreshProfile(session.employeeId);
        } catch (error) {
            clearSession();
            showLoginPanel();
        }
    }

    bootstrap();
})();
