const express = require("express");
const { registerUser, loginUser, listUsers, getUserById} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId", getUserById); // Endpoint pentru a lista utilizatorii
router.get("/",listUsers)
module.exports = router;
