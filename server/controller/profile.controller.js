const userModel = require("../model/user.model");

// chuẩn hóa dữ liệu response
function toPublicProfile(u) {
    return {
        userName: u.username,
        email: u.email,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
    };
}

async function getProfile(req, res) {
    const userId = req.user.id;
    try {
        const user = await userModel.getProfile(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({
            message: "User profile retrieved successfully",
            data: toPublicProfile(user),
        });
    } catch (err) {
        console.error("Error getting user profile:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateProfile(req, res) {
    const userId = req.user.id;
    const { displayName, avatarUrl, email } = req.body;

    try {
        const updated = await userModel.updateProfile(userId, { displayName, email, avatarUrl });
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        const fresh = await userModel.getProfile(userId);
        return res.status(200).json({
            message: "User profile updated successfully",
            data: toPublicProfile(fresh),
        });
    } catch (err) {
        console.error("Error updating user profile:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Tìm kiếm user
async function searchUsers(req, res) {
    try {
        const { q, limit = 20 } = req.query;
        const currentUserId = req.user.id;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const users = await userModel.searchUsers(q.trim(), currentUserId, parseInt(limit));
        return res.status(200).json({
            message: "Users found successfully",
            data: users.map(toPublicProfile),
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy danh sách tất cả user
async function getAllUsers(req, res) {
    try {
        const { limit = 50 } = req.query;
        const currentUserId = req.user.id;

        const users = await userModel.getAllUsers(currentUserId, parseInt(limit));
        return res.status(200).json({
            message: "All users retrieved successfully",
            data: users.map(toPublicProfile),
        });
    } catch (error) {
        console.error("Error getting all users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy thông tin user theo ID
async function getUserById(req, res) {
    try {
        const { userId } = req.params;
        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User found successfully",
            data: toPublicProfile(user),
        });
    } catch (error) {
        console.error("Error getting user by id:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getProfile, updateProfile, searchUsers, getAllUsers, getUserById };
