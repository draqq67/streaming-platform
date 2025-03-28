const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, getUsers } = require("../models/userModel");
const { get } = require("../routes/userRoutes");

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await createUser(username, email, hashedPassword);
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

module.exports = { registerUser, loginUser, listUsers};
