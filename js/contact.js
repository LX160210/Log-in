// contact.js - 联系页面脚本
// 功能：处理留言表单的提交，将用户输入发送到后端 API 并显示反馈

(function () {
    // 获取页面元素
    const contactForm = document.getElementById("contactForm"); // 留言表单
    const contactMessage = document.getElementById("contactMessage"); // 留言输入框
    const contactFeedback = document.getElementById("contactFeedback"); // 反馈显示区域

    // 如果页面没有表单（比如脚本加载失败），直接退出
    if (!contactForm) {
        return;
    }

    // 监听表单提交事件
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // 阻止默认表单提交（页面刷新）
        contactFeedback.textContent = ""; // 清空之前的反馈消息

        const message = contactMessage.value.trim(); // 获取用户输入的留言，并去掉前后空格

        try {
            // 发送 POST 请求到后端 /api/contact 接口
            const response = await fetch("/api/contact", {
                method: "POST", // 请求方法
                headers: { "Content-Type": "application/json" }, // 告诉服务器发送的是 JSON 数据
                body: JSON.stringify({ message: message }) // 将留言打包成 JSON 发送
            });

            // 解析服务器返回的 JSON 数据
            const data = await response.json();

            // 如果服务器返回错误状态码，抛出错误
            if (!response.ok) {
                throw new Error(data.message || "提交失败");
            }

            // 提交成功：显示服务器反馈消息，重置表单
            contactFeedback.textContent = data.message;
            contactForm.reset(); // 清空表单输入
        } catch (error) {
            // 网络错误或服务器错误：显示错误消息
            contactFeedback.textContent = error.message;
        }
    });
})();