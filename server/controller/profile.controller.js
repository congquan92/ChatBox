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

module.exports = { getProfile, updateProfile };
