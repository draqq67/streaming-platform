const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, getUsers, getUser } = require("../models/userModel");
const { get } = require("../routes/userRoutes");
const pool = require("../config/db");

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const existingUsername = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUsername.rows.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, email, hashedPassword);

        // Respond without password
        const { id, username: userName, email: userEmail, role } = newUser.rows[0];
        res.status(201).json({ id, username: userName, email: userEmail, role });

    } catch (err) {
        console.error("Error during registration:", err.message, err.stack);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user.rows.length) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    res.json({ token });
};

const listUsers = async(req,res)=>{
    try{
        const users = await getUsers();
        res.json(users.rows)
    }
    catch(err)
    {
        res.status(500).json({error: err.message})
    }
}
const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await getUser(userId);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
}

module.exports = { registerUser, loginUser, listUsers, getUserById };
