// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const crypto = require("crypto");
const db = require("./db"); // mysql2/promise pool

const app = express();
const PORT = 3000;

// ---------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------
// LOGIN ROUTE
// ---------------------------------------------------
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT id, name, email, password_hash, role, division, department FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            division: user.division,
            department: user.department
        };

        res.json({ user: sessionUser });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------------------------------------------
// REQUEST PASSWORD RESET
// ---------------------------------------------------
app.post("/api/request-reset", async (req, res) => {
    const { email } = req.body;

    try {
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const [result] = await db.execute(
            "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
            [token, expires, email]
        );

        // Always respond the same (no email enumeration)
        if (result.affectedRows === 0) {
            return res.status(200).json({
                message: "If the email exists, a reset link was generated."
            });
        }

        const resetLink = `http://100.70.48.35:5500/pages/reset-password.html?token=${token}`;

        res.json({
            message: "Reset link generated.",
            resetLink
        });
    } catch (err) {
        console.error("RESET REQUEST ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------
app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW() LIMIT 1",
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const userId = rows[0].id;
        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
            [hash, userId]
        );

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------------------------------------------
// FALLBACK TO LOGIN PAGE
// ---------------------------------------------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});

// ---------------------------------------------------
// START SERVER
// ---------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend running at http://100.70.48.35:${PORT}`);
});
