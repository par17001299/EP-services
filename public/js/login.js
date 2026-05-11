// login.js

(function () {
    const app = document.getElementById("app");

    // Inject bright login UI
    app.innerHTML = `
        <div class="auth-card fade-in" style="max-width:420px;margin:80px auto;padding:30px;background:white;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,0.1);">
            <h1 style="color:#ff7b47;text-align:center;margin-bottom:25px;">Sign in</h1>

            <form id="loginForm">
                <label>Email</label>
                <input type="email" id="email" required>

                <label>Password</label>
                <input type="password" id="password" required>

                <button type="submit" style="margin-top:20px;width:100%;">Login</button>
            </form>

            <div id="loginError" style="display:none;margin-top:15px;color:#d9534f;font-weight:600;text-align:center;"></div>
        </div>
    `;

    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.style.display = "none";
        errorBox.textContent = "";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                errorBox.textContent = data.error || "Login failed";
                errorBox.style.display = "block";
                return;
            }

            // Save session
            localStorage.setItem("currentUser", JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = "../public/pages/dashboard.html";

        } catch (err) {
            console.error("Login error:", err);
            errorBox.textContent = "Server error — backend unreachable";
            errorBox.style.display = "block";
        }
    });
})();
