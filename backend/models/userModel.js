const pool = require("../config/db");

const createUser = async (username, email, hashedPassword) => {
    return pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3,$4) RETURNING *",
        [username, email, hashedPassword, "user"]
    );
};

const findUserByEmail = async (email) => {
    return pool.query("SELECT * FROM users WHERE email = $1", [email]);
};

const getUsers = async() =>{
    return pool.query(" SELECT * FROM users")
}
const getUser = async(userId) => {
    return pool.query("SELECT * FROM users WHERE id = $1", [userId]);
}
module.exports = { createUser, findUserByEmail,getUsers,getUser };