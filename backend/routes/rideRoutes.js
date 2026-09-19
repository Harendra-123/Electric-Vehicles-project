const express = require("express");

const router = express.Router();

const db = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ==================================================
// CREATE RIDE
// USER ONLY
// ==================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {

        const {
            driver_id,
            vehicle_id,
            pickup,
            destination,
            distance,
            fare
        } = req.body;


        if (
            !pickup ||
            !destination ||
            !distance ||
            !fare
        ) {

            return res.status(400).json({
                success: false,
                message: "Pickup, destination, distance and fare are required"
            });

        }


        const user_id = req.user.id;


        const sql = `
            INSERT INTO rides
            (
                user_id,
                driver_id,
                vehicle_id,
                pickup,
                destination,
                distance,
                fare,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                user_id,
                driver_id ?? null,
                vehicle_id ?? null,
                pickup,
                destination,
                distance,
                fare,
                "requested"
            ],
            (err, result) => {

                if (err) {

                    console.log("Ride insert error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Ride booking failed",
                        error: err.message
                    });

                }


                res.status(201).json({
                    success: true,
                    message: "Ride booked successfully",
                    rideId: result.insertId
                });

            }
        );

    }
);


// ==================================================
// GET DRIVER STATUS / AVAILABILITY
// DRIVER ONLY
// ==================================================

router.get(
    "/driver/availability",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const driverUserId = req.user.id;

        const sql = `
            SELECT is_online
            FROM drivers
            WHERE user_id = ?
        `;

        db.query(sql, [driverUserId], (err, results) => {
            if (err) {
                console.log("Driver availability error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch driver availability"
                });
            }

            const is_online = results[0]?.is_online === 1 || results[0]?.is_online === true;

            res.status(200).json({
                success: true,
                is_online
            });
        });
    }
);

router.put(
    "/driver/availability",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const driverUserId = req.user.id;
        const { is_online } = req.body;

        if (typeof is_online !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_online must be a boolean value"
            });
        }

        const sql = `
            UPDATE drivers
            SET is_online = ?
            WHERE user_id = ?
        `;

        db.query(sql, [is_online ? 1 : 0, driverUserId], (err) => {
            if (err) {
                console.log("Driver availability update error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update driver availability",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: is_online ? "Driver went online" : "Driver went offline",
                is_online: !!is_online
            });
        });
    }
);

// ==================================================
// GET MY RIDES
// USER ONLY
// ==================================================

router.get(
    "/my-rides",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {

        const user_id = req.user.id;


        const sql = `
            SELECT
                rides.id,
                rides.user_id,
                rides.driver_id,
                rides.vehicle_id,
                rides.pickup,
                rides.destination,
                rides.distance,
                rides.fare,
                rides.status,

                drivers.license_no,

                vehicles.model,
                vehicles.vehicle_number,
                vehicles.vehicle_type

            FROM rides

            LEFT JOIN drivers
            ON rides.driver_id = drivers.id

            LEFT JOIN vehicles
            ON rides.vehicle_id = vehicles.id

            WHERE rides.user_id = ?

            ORDER BY rides.id DESC
        `;


        db.query(
            sql,
            [user_id],
            (err, results) => {

                if (err) {

                    console.log("Get my rides error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch rides",
                        error: err.message
                    });

                }


                res.status(200).json({
                    success: true,
                    rides: results
                });

            }
        );

    }
);

// ==================================================
// GET DRIVER RIDE REQUESTS
// DRIVER ONLY
// ==================================================

router.get(
    "/driver/requests",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {

        const driverUserId = req.user.id;

        const driverLookupSql = `
            SELECT id
            FROM drivers
            WHERE user_id = ?
        `;

        db.query(driverLookupSql, [driverUserId], (driverLookupErr, driverRows) => {
            if (driverLookupErr) {
                console.log("Driver lookup error:", driverLookupErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch driver profile"
                });
            }

            const currentDriverId = driverRows[0]?.id;

            if (!currentDriverId) {
                return res.status(200).json({
                    success: true,
                    requests: []
                });
            }

            const sql = `
                SELECT
                    rides.id,
                    rides.user_id,
                    rides.driver_id,
                    rides.vehicle_id,
                    rides.pickup,
                    rides.destination,
                    rides.distance,
                    rides.fare,
                    rides.status,

                    users.name AS user_name,
                    users.phone AS user_phone,

                    vehicles.model,
                    vehicles.vehicle_number,
                    vehicles.vehicle_type

                FROM rides
                JOIN users
                ON rides.user_id = users.id
                LEFT JOIN vehicles
                ON rides.vehicle_id = vehicles.id

                WHERE (
                    rides.status = 'requested'
                    OR (rides.driver_id = ? AND rides.status IN ('accepted', 'started'))
                )
                ORDER BY rides.id DESC
            `;

            db.query(
                sql,
                [currentDriverId],
                (err, results) => {

                    if (err) {

                        console.log(
                            "Driver requests error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to fetch ride requests",
                            error: err.message
                        });

                    }

                    res.status(200).json({
                        success: true,
                        requests: results
                    });

                }
            );
        });

    }
);


// ================= ACCEPT RIDE =================

router.put(
    "/:rideId/accept",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {

        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const driverLookupSql = `
            SELECT id
            FROM drivers
            WHERE user_id = ?
        `;

        db.query(driverLookupSql, [driverUserId], (driverLookupErr, driverRows) => {
            if (driverLookupErr) {
                console.log("Driver lookup error:", driverLookupErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch driver profile"
                });
            }

            const currentDriverId = driverRows[0]?.id;

            if (!currentDriverId) {
                return res.status(404).json({
                    success: false,
                    message: "Driver profile not found"
                });
            }

            const sql = `
                UPDATE rides
                SET driver_id = ?, status = 'accepted'
                WHERE id = ?
                AND status = 'requested'
            `;

            db.query(
                sql,
                [currentDriverId, rideId],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to accept ride",
                            error: err.message
                        });

                    }

                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "Ride not found or already accepted"
                        });

                    }

                    res.json({
                        success: true,
                        message: "Ride accepted successfully",
                        rideId: rideId
                    });

                }
            );
        });

    }
);

// ================= START RIDE =================

router.put(
    "/:rideId/start",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {

        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const sql = `
            UPDATE rides
            JOIN drivers
            ON rides.driver_id = drivers.id
            SET rides.status = 'started'
            WHERE rides.id = ?
            AND drivers.user_id = ?
            AND rides.status = 'accepted'
        `;

        db.query(
            sql,
            [rideId, driverUserId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to start ride",
                        error: err.message
                    });

                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Ride not found or ride is not accepted"
                    });

                }

                res.json({
                    success: true,
                    message: "Ride started successfully",
                    rideId: rideId
                });

            }
        );

    }
);

// ================= COMPLETE RIDE =================

router.put(
    "/:rideId/complete",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {

        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const sql = `
            UPDATE rides
            JOIN drivers
            ON rides.driver_id = drivers.id
            SET rides.status = 'completed'
            WHERE rides.id = ?
            AND drivers.user_id = ?
            AND rides.status = 'started'
        `;

        db.query(
            sql,
            [rideId, driverUserId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to complete ride",
                        error: err.message
                    });

                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Ride not found or ride is not started"
                    });

                }

                res.json({
                    success: true,
                    message: "Ride completed successfully",
                    rideId: rideId
                });

            }
        );

    }
);


// ================= GET RIDE HISTORY =================

router.get(
    "/history",
    authMiddleware,
    (req, res) => {

        const userId = req.user.id;

        const sql = `
            SELECT
                r.id AS ride_id,
                r.user_id,
                r.driver_id,
                r.vehicle_id,
                r.pickup,
                r.destination,
                r.distance,
                r.fare,
                r.status AS ride_status,

                p.id AS payment_id,
                p.amount AS payment_amount,
                p.payment_method,
                p.payment_status

            FROM rides r

            LEFT JOIN payments p
                ON r.id = p.ride_id

            WHERE r.user_id = ?

            ORDER BY r.id DESC
        `;

        db.query(
            sql,
            [userId],
            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch ride history"
                    });
                }

                res.status(200).json({
                    success: true,
                    rides: results
                });

            }
        );

    }
);

// ==================================================
// GET RIDE BY ID
// USER ONLY
// ==================================================

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {

        const rideId = req.params.id;

        const user_id = req.user.id;


        const sql = `
            SELECT
                rides.id,
                rides.user_id,
                rides.driver_id,
                rides.vehicle_id,
                rides.pickup,
                rides.destination,
                rides.distance,
                rides.fare,
                rides.status,

                drivers.license_no,

                vehicles.model,
                vehicles.vehicle_number,
                vehicles.vehicle_type

            FROM rides

            LEFT JOIN drivers
            ON rides.driver_id = drivers.id

            LEFT JOIN vehicles
            ON rides.vehicle_id = vehicles.id

            WHERE rides.id = ?
            AND rides.user_id = ?
        `;


        db.query(
            sql,
            [rideId, user_id],
            (err, results) => {

                if (err) {

                    console.log("Get ride error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch ride",
                        error: err.message
                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Ride not found"
                    });

                }


                res.status(200).json({
                    success: true,
                    ride: results[0]
                });

            }
        );

    }
);

// ================= CANCEL RIDE =================

router.delete(
    "/:rideId",
    authMiddleware,
    (req, res) => {

        const rideId = req.params.rideId;
        const userId = req.user.id;


        // ================= CHECK RIDE =================

        const checkRideSql = `
            SELECT id, user_id, status
            FROM rides
            WHERE id = ?
        `;

        db.query(
            checkRideSql,
            [rideId],
            (err, rides) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }


                // Ride not found
                if (rides.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Ride not found"
                    });
                }


                const ride = rides[0];


                // ================= CHECK USER =================

                if (ride.user_id !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: "You cannot cancel this ride"
                    });
                }


                // ================= CHECK STATUS =================

                if (ride.status === "completed") {
                    return res.status(400).json({
                        success: false,
                        message: "Completed ride cannot be cancelled"
                    });
                }


                if (ride.status === "cancelled") {
                    return res.status(400).json({
                        success: false,
                        message: "Ride is already cancelled"
                    });
                }


                // ================= CANCEL RIDE =================

                const updateRideSql = `
                    UPDATE rides
                    SET status = 'cancelled'
                    WHERE id = ?
                `;

                db.query(
                    updateRideSql,
                    [rideId],
                    (err, result) => {

                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Failed to cancel ride"
                            });
                        }


                        if (result.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                message: "Ride not found"
                            });
                        }


                        // ================= SUCCESS =================

                        res.status(200).json({
                            success: true,
                            message: "Ride cancelled successfully",
                            rideId: rideId
                        });

                    }
                );

            }
        );

    }
);

// ================= GET DRIVER SUMMARY =================

router.get(
    "/driver/summary",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {

        const driverUserId = req.user.id;

        const sql = `
            SELECT
                d.id AS driver_id,
                u.name,
                COUNT(r.id) AS total_rides,
                COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.fare ELSE 0 END), 0) AS total_earnings,
                COALESCE(SUM(CASE WHEN r.status IN ('accepted', 'started') THEN 1 ELSE 0 END), 0) AS active_rides,
                MAX(CASE WHEN v.model IS NOT NULL THEN v.model ELSE 'EV Vehicle' END) AS vehicle_name,
                MAX(CASE WHEN v.vehicle_number IS NOT NULL THEN v.vehicle_number ELSE 'NA' END) AS vehicle_number
            FROM drivers d
            JOIN users u ON u.id = d.user_id
            LEFT JOIN rides r ON r.driver_id = d.id
            LEFT JOIN vehicles v ON v.id = r.vehicle_id
            WHERE d.user_id = ?
            GROUP BY d.id, u.name
        `;

        db.query(
            sql,
            [driverUserId],
            (err, results) => {

                if (err) {
                    console.log("Driver summary error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch driver summary",
                        error: err.message
                    });
                }

                const summary = results[0] || {
                    driver_id: null,
                    name: req.user.name || "Driver",
                    total_rides: 0,
                    total_earnings: 0,
                    active_rides: 0,
                    vehicle_name: "EV Vehicle",
                    vehicle_number: "NA"
                };

                res.status(200).json({
                    success: true,
                    summary: {
                        ...summary,
                        rating: 4.8,
                        wallet: Number(summary.total_earnings || 0),
                        todayEarning: Number(summary.total_earnings || 0)
                    }
                });

            }
        );

    }
);

module.exports = router;