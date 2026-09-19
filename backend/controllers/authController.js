const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");


// ================= SIGNUP =================

exports.signup = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            role
        } = req.body;

        if (!name || !email || !password || !phone) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        const checkSql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(
            checkSql,
            [email],
            async (err, results) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });

                }

                if (results.length > 0) {

                    return res.status(400).json({
                        success: false,
                        message: "Email already exists"
                    });

                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO users
                    (name, email, password, phone, role)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword,
                        phone,
                        role || "user"
                    ],
                    (err, result) => {

                        if (err) {

                            return res.status(500).json({
                                success: false,
                                message: "Signup failed"
                            });

                        }

                        res.status(201).json({
                            success: true,
                            message: "Signup successful",
                            userId: result.insertId
                        });

                    }
                );

            }
        );

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// ================= LOGIN =================

exports.login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        async (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });

        }
    );

};


// ================= FORGOT PASSWORD =================

exports.forgotPassword = (req, res) => {

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {

        return res.status(400).json({
            success: false,
            message: "Email and new password are required"
        });

    }

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateSql = `
            UPDATE users
            SET password = ?
            WHERE email = ?
        `;

        db.query(updateSql, [hashedPassword, email], (error) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Password reset failed"
                });

            }

            return res.json({
                success: true,
                message: "Password reset successful. Please login with your new password."
            });

        });

    });

};