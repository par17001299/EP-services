(function () {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="auth-card fade-in">
            <h1>Sign in</h1>
            <form id="loginForm">
                <label>Email</label>
                <input type="email" id="email" required>

                <label>Password</label>
                <input type="password" id="password" required>

                <button type="submit">Login</button>
            </form>
            <div id="loginError" class="error" style="display:none;"></div>
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                errorBox.textContent = data.error || "Login failed";
                errorBox.style.display = "block";
                return;
            }

            localStorage.setItem("currentUser", JSON.stringify(data.user));

            window.location.href = "/pages/dashboard.html";
        } catch (err) {
            console.error(err);
            errorBox.textContent = "Server error";
            errorBox.style.display = "block";
        }
    });
})();
