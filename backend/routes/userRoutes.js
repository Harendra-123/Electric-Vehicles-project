const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", async (req, res) => {
    console.log("POST /users request received");

    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password and phone are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, phone, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword, phone, role || "user"],
            (err, result) => {
                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "User insert failed"
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "User inserted successfully",
                    userId: result.insertId
                });
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User insert failed",
            error: error.message
        });
    }
});

router.get("/profile", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT id, name, phone, email, role
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: results[0]
        });
    });
});

router.get("/me", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            role: req.user.role
        }
    });
});

router.put("/profile", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { name, phone, email, password } = req.body;

    if (!name && !phone && !email && !password) {
        return res.status(400).json({
            success: false,
            message: "At least one field is required to update" 
        });
    }

    try {
        const updates = [];
        const values = [];

        if (name) {
            updates.push("name = ?");
            values.push(name);
        }

        if (phone) {
            updates.push("phone = ?");
            values.push(phone);
        }

        if (email) {
            updates.push("email = ?");
            values.push(email);
        }

        if (password) {
            updates.push("password = ?");
            values.push(await bcrypt.hash(password, 10));
        }

        values.push(userId);

        const sql = `
            UPDATE users
            SET ${updates.join(", ")}
            WHERE id = ?
        `;

        db.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update profile",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const fetchSql = `
                SELECT id, name, phone, email, role
                FROM users
                WHERE id = ?
            `;

            db.query(fetchSql, [userId], (fetchErr, rows) => {
                if (fetchErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Profile updated but could not be reloaded"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Profile updated successfully",
                    user: rows[0]
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
});

module.exports = router;