const db = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser({ username, password, email, displayName }) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query("INSERT INTO users (username, email, password, displayName) VALUES (?, ?, ?, ?)", [username, email, hashedPassword, displayName]);
        return { id: result.insertId, message: "User created successfully", data: { username, email, displayName } };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

async function findUserByUsername(username) {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        return rows[0];
    } catch (error) {
        console.error("Error finding user by username:", error);
        throw error;
    }
}
async function findUserByEmail(email) {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

async function getProfile(userId) {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        return rows[0];
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
}

async function updateProfile(userId, { displayName, email, avatarUrl }) {
    try {
        const [result] = await db.query("UPDATE users SET displayName = ?, email = ?, avatarUrl = ? WHERE id = ?", [displayName, email, avatarUrl, userId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

// Tìm kiếm user theo username hoặc displayName
async function searchUsers(query, currentUserId, limit = 20) {
    try {
        const [rows] = await db.query(
            `
            SELECT id, username, displayName, avatarUrl, createdAt
            FROM users 
            WHERE (username LIKE ? OR displayName LIKE ?) 
            AND id != ?
            LIMIT ?
        `,
            [`%${query}%`, `%${query}%`, currentUserId, limit]
        );

        return rows;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
}

// Lấy danh sách tất cả user (trừ current user)
async function getAllUsers(currentUserId, limit = 50) {
    try {
        const [rows] = await db.query(
            `
            SELECT id, username, displayName, avatarUrl, createdAt
            FROM users 
            WHERE id != ?
            ORDER BY displayName
            LIMIT ?
        `,
            [currentUserId, limit]
        );

        return rows;
    } catch (error) {
        console.error("Error getting all users:", error);
        throw error;
    }
}

// Lấy thông tin user theo ID (public info)
async function getUserById(userId) {
    try {
        const [rows] = await db.query(
            `
            SELECT id, username, displayName, avatarUrl, createdAt
            FROM users 
            WHERE id = ?
        `,
            [userId]
        );

        return rows[0];
    } catch (error) {
        console.error("Error getting user by id:", error);
        throw error;
    }
}

module.exports = {
    createUser,
    findUserByUsername,
    findUserByEmail,
    getProfile,
    updateProfile,
    searchUsers,
    getAllUsers,
    getUserById,
};
