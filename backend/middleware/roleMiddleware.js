const normalizeRole = (role) => {
    const value = String(role || "").trim().toLowerCase();

    if (["uder", "user", "rider", "passenger"].includes(value)) {
        return "user";
    }

    return value;
};

const roleMiddleware = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const userRole = normalizeRole(req.user.role);
        const allowed = allowedRoles.map((role) => normalizeRole(role));

        if (!allowed.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        next();
    };

};

module.exports = roleMiddleware;