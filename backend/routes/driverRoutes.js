const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const driverController = require("../controllers/driverController");

// ================= CREATE DRIVER =================
router.post("/", driverController.createDriver);

// ================= GET ALL DRIVERS =================
router.get("/", driverController.getAllDrivers);

// ================= GET DRIVER PROFILE =================
router.get("/profile", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            d.id,
            d.user_id,
            d.license_no,
            u.name,
            u.email,
            u.phone,
            u.role
        FROM drivers d
        JOIN users u ON u.id = d.user_id
        WHERE d.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch driver profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }

        res.status(200).json({
            success: true,
            driver: results[0]
        });
    });
});

// ================= UPDATE DRIVER PROFILE =================
router.put("/profile", authMiddleware, roleMiddleware("driver"), async (req, res) => {
    const userId = req.user.id;
    const { name, phone, email, password, license_no } = req.body;

    if (!name && !phone && !email && !password && !license_no) {
        return res.status(400).json({
            success: false,
            message: "At least one field is required to update"
        });
    }

    try {
        const userUpdates = [];
        const userValues = [];

        if (name) {
            userUpdates.push("name = ?");
            userValues.push(name);
        }

        if (phone) {
            userUpdates.push("phone = ?");
            userValues.push(phone);
        }

        if (email) {
            userUpdates.push("email = ?");
            userValues.push(email);
        }

        if (password) {
            userUpdates.push("password = ?");
            userValues.push(await bcrypt.hash(password, 10));
        }

        if (userUpdates.length > 0) {
            userValues.push(userId);
            const userSql = `UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`;

            await new Promise((resolve, reject) => {
                db.query(userSql, userValues, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        if (license_no) {
            const driverSql = `UPDATE drivers SET license_no = ? WHERE user_id = ?`;
            await new Promise((resolve, reject) => {
                db.query(driverSql, [license_no, userId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        const fetchSql = `
            SELECT
                d.id,
                d.user_id,
                d.license_no,
                u.name,
                u.email,
                u.phone,
                u.role
            FROM drivers d
            JOIN users u ON u.id = d.user_id
            WHERE d.user_id = ?
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
                message: "Driver profile updated successfully",
                driver: rows[0]
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update driver profile",
            error: error.message
        });
    }
});

module.exports = router;