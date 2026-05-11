// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./db"); // mysql2/promise pool

const app = express();
const PORT = 3000;

// ---------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------
app.use(cors()); // allow frontend on 5500 or GitHub Pages
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));


// ---------------------------------------------------
// LOGIN ROUTE (Database-backed)
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

        // Compare hashed password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Build safe session object
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
// FALLBACK — Always send login page
// ---------------------------------------------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});


// ---------------------------------------------------
// START SERVER
// ---------------------------------------------------
app.listen(PORT, () => {
    console.log(`EP Systems backend running at http://localhost:${PORT}`);
});
