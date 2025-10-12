const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
    const { username, password, email, displayName } = req.body;
    const existUsername = await userModel.findUserByUsername(username);
    const existEmail = await userModel.findUserByEmail(email);
    if (existUsername) {
        return res.status(409).json({ message: "Username already exists" });
    }
    if (existEmail) {
        return res.status(409).json({ message: "Email already exists" });
    }

    try {
        const result = await userModel.createUser({ username, password, email, displayName });
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

//dùng HS256
async function loginUser(req, res) {
    const { username, password } = req.body;
    const checkUser = await userModel.findUserByUsername(username);
    if (!checkUser) {
        return res.status(404).json({ message: "Username or password wrong" });
    }
    try {
        const match = await bcrypt.compare(password, checkUser.password); // checkUser trả về row
        if (!match) {
            return res.status(404).json({ message: "Username or password wrong" });
        }
        const token = jwt.sign({ id: checkUser.id, username: checkUser.username, displayName: checkUser.displayName, avatarUrl: checkUser.avatarUrl }, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_EXPIRES_IN}`, algorithm: "HS256" });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { registerUser, loginUser };
