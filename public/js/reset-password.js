(function () {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="auth-card fade-in">
            <h1>Forgot Password</h1>

            <form id="resetRequestForm">
                <label>Email</label>
                <input type="email" id="email" required>

                <button type="submit">Send Reset Link</button>
            </form>

            <div id="msg" style="margin-top:15px;"></div>
        </div>
    `;

    const form = document.getElementById("resetRequestForm");
    const msg = document.getElementById("msg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        const res = await fetch("http://localhost:3000/api/request-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        msg.innerHTML = `
            <div style="color:#28c76f;font-weight:600;">
                If the email exists, a reset link was generated.
            </div>
            <div style="margin-top:10px;font-size:13px;">
                <strong>Dev Mode Link:</strong><br>
                <a href="${data.resetLink}">${data.resetLink}</a>
            </div>
        `;
    });
})();
