const jwt = require("jsonwebtoken");
const { getUser } = require("../models/userModel"); // Assuming this function fetches user from the database

const authenticateUser = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        console.log("Decoded Token:", decoded); // Log decoded token to debug

        // Find the user by ID in the database
        const user = await getUser(decoded.userId); // You can use any method to query your DB
        if (!user || !user.rows[0]) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user.rows[0]; // Attach user data to request
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Admin middleware that uses the user data attached to the request object
const checkAdmin = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }
    let decoded;
    try {
        // Verify token using the secret key
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Optional: for debugging
        const user = await getUser(decoded.userId);

        if (!user || !user.rows[0]) {
            return res.status(401).json({ error: "User not found" });
        }

        const userRole = user.rows[0].role; // Access the role from the first row of the result
        console.log("User Role from DB:", userRole); // Log the role to debug

        if (userRole === 'admin') {
            next();
        } else {
            res.status(403).json({ error: "Access denied. Admins only." });
        }
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Optional: for debugging

        // Find the user by ID from the database
        const user = await getUser(decoded.userId);
        if (!user || !user.rows[0]) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user.rows[0]; // Attach the user to the request object
        next(); // Move to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = { authenticateUser, checkAdmin, authenticateToken };
