const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= CREATE PAYMENT =================
router.post(
    "/",
    authMiddleware,
    (req, res) => {
        const {
            ride_id,
            amount,
            payment_method
        } = req.body;

        if (!ride_id || !amount || !payment_method) {
            return res.status(400).json({
                success: false,
                message: "ride_id, amount and payment_method are required"
            });
        }

        const checkRideSql = `
            SELECT id, user_id, fare, status
            FROM rides
            WHERE id = ?
        `;

        db.query(
            checkRideSql,
            [ride_id],
            (err, rides) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (rides.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Ride not found"
                    });
                }

                const ride = rides[0];

                if (ride.status !== "completed") {
                    return res.status(400).json({
                        success: false,
                        message: "Payment can only be made after ride completion"
                    });
                }

                if (ride.user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: "You cannot pay for this ride"
                    });
                }

                const sql = `
                    INSERT INTO payments
                    (
                        ride_id,
                        amount,
                        payment_method,
                        payment_status
                    )
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        ride_id,
                        amount,
                        payment_method,
                        "paid"
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message: "Payment failed",
                                error: err.message
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Payment successful",
                            paymentId: result.insertId
                        });
                    }
                );
            }
        );
    }
);

// ================= GET PAYMENT BY RIDE =================
router.get("/my-payments", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            p.id,
            p.ride_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            r.pickup,
            r.destination,
            r.status AS ride_status,
            r.fare
        FROM payments p
        JOIN rides r ON r.id = p.ride_id
        WHERE r.user_id = ?
        ORDER BY p.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user payments"
            });
        }

        res.status(200).json({
            success: true,
            payments: results
        });
    });
});

router.get("/ride/:rideId", authMiddleware, (req, res) => {
    const rideId = req.params.rideId;

    const sql = `
        SELECT *
        FROM payments
        WHERE ride_id = ?
    `;

    db.query(
        sql,
        [rideId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch payment"
                });
            }

            res.json({
                success: true,
                payments: results
            });
        }
    );
});

module.exports = router;