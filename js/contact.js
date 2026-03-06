AC(function () {
    const contactForm = document.getElementById("contactForm");
    const contactMessage = document.getElementById("contactMessage");
    const contactFeedback = document.getElementById("contactFeedback");

    if (!contactForm) {
        return;
    }

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        contactFeedback.textContent = "";

        const message = contactMessage.value.trim();

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "提交失败");
            }

            contactFeedback.textContent = data.message;
            contactForm.reset();
        } catch (error) {
            contactFeedback.textContent = error.message;
        }
    });
})();
