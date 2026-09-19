const app = require("./app");
require("dotenv").config();

const db = require("./config/db");

const ensureDriverOnlineColumn = () => {
    db.query("SHOW COLUMNS FROM drivers LIKE 'is_online'", (err, rows) => {
        if (err) {
            console.error("Failed to check drivers schema:", err);
            return;
        }

        if (rows.length === 0) {
            db.query(
                "ALTER TABLE drivers ADD COLUMN is_online TINYINT(1) NOT NULL DEFAULT 0",
                (alterErr) => {
                    if (alterErr) {
                        console.error("Failed to add drivers.is_online column:", alterErr);
                    } else {
                        console.log("Added drivers.is_online column");
                    }
                }
            );
        }
    });
};

const ensureRideCreatedAtColumn = () => {
    db.query("SHOW COLUMNS FROM rides LIKE 'created_at'", (err, rows) => {
        if (err) {
            console.error("Failed to check rides schema:", err);
            return;
        }

        if (rows.length === 0) {
            db.query(
                "ALTER TABLE rides ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                (alterErr) => {
                    if (alterErr) {
                        console.error("Failed to add rides.created_at column:", alterErr);
                    } else {
                        console.log("Added rides.created_at column");
                    }
                }
            );
        }
    });
};

ensureDriverOnlineColumn();
ensureRideCreatedAtColumn();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});