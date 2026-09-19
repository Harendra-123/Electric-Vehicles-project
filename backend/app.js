const express = require("express");
const cors = require("cors");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ================= ROUTES =================

const userRoutes =
    require("./routes/userRoutes");

const authRoutes =
    require("./routes/authRoutes");

const rideRoutes =
    require("./routes/rideRoutes");

const driverRoutes =
    require("./routes/driverRoutes");

const vehicleRoutes =
    require("./routes/vehicleRoutes");

const paymentRoutes =
    require("./routes/paymentRoutes");

const reviewRoutes = require("./routes/reviewRoutes");

const chargingStationRoutes = require("./routes/chargingStationRoutes");

const adminRoutes = require("./routes/adminRoutes");

const bookingRoutes = require("./routes/bookingRoutes");



// ================= AUTH MIDDLEWARE =================

const authMiddleware =
    require("./middleware/authMiddleware");


 // ================= role MIDDLEWARE =================
 const roleMiddleware =
    require("./middleware/roleMiddleware");


// ================= API ROUTES =================

app.use("/users", userRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/rides", rideRoutes);

app.use("/api/drivers", driverRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/charging-stations", chargingStationRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/auth", authRoutes);




// ================= JWT TEST ROUTE =================

app.get("/api/protected", authMiddleware, (req, res) => {

    res.json({
        success: true,
        message: "You can access protected route",
        user: req.user
    });

});


// ================= jwt role test ROUTE =================

app.get(
    "/api/user-only",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {

        res.json({
            success: true,
            message: "User can access this route",
            user: req.user
        });

    }
);


// ================= TEST ROUTE =================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Electric Vehicle Booking API is running"
    });

});


module.exports = app;