const conversationModel = require("../model/conversation.model");

// Chuẩn hóa dữ liệu conversation response
function toPublicConversation(conversation) {
    return {
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        avatarUrl: conversation.avatarUrl,
        coverGifUrl: conversation.coverGifUrl,
        label: conversation.label,
        createdAt: conversation.createdAt,
        memberCount: conversation.memberCount,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        userRole: conversation.role || conversation.userRole,
        members: conversation.members || [],
    };
}

// Tạo conversation mới
async function createConversation(req, res) {
    const userId = req.user.id;
    const { type = "direct", title, avatarUrl, coverGifUrl, label = "Custom", memberIds = [] } = req.body;

    try {
        // Nếu là direct conversation, kiểm tra chỉ có 1 member khác
        if (type === "direct") {
            if (memberIds.length !== 1) {
                return res.status(400).json({ message: "Direct conversation must have exactly 2 members" });
            }

            // Kiểm tra xem đã có conversation direct giữa 2 user chưa
            const existingConversation = await conversationModel.findDirectConversation(userId, memberIds[0]);
            if (existingConversation) {
                return res.status(409).json({
                    message: "Direct conversation already exists",
                    data: { conversationId: existingConversation.id },
                });
            }
        }

        const result = await conversationModel.createConversation({
            type,
            title,
            avatarUrl,
            coverGifUrl,
            label,
            creatorId: userId,
            memberIds,
        });

        return res.status(201).json({
            message: result.message,
            data: { conversationId: result.id },
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Lấy danh sách conversation của user
async function getUserConversations(req, res) {
    const userId = req.user.id;

    try {
        const conversations = await conversationModel.getUserConversations(userId);

        return res.status(200).json({
            message: "Conversations retrieved successfully",
            data: conversations.map(toPublicConversation),
        });
    } catch (error) {
        console.error("Error getting user conversations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Lấy thông tin chi tiết conversation
async function getConversationById(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        const conversation = await conversationModel.getConversationById(conversationId, userId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found or access denied" });
        }

        return res.status(200).json({
            message: "Conversation retrieved successfully",
            data: conversation,
        });
    } catch (error) {
        console.error("Error getting conversation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Thêm member vào conversation
async function addMember(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { memberIds, role = "member" } = req.body;

    try {
        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "memberIds must be a non-empty array" });
        }

        const results = [];
        for (const memberId of memberIds) {
            try {
                const success = await conversationModel.addMemberToConversation(conversationId, userId, memberId, role);
                results.push({ memberId, success });
            } catch (error) {
                results.push({ memberId, success: false, error: error.message });
            }
        }

        return res.status(200).json({
            message: "Add members operation completed",
            data: results,
        });
    } catch (error) {
        console.error("Error adding members:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Xóa member khỏi conversation
async function removeMember(req, res) {
    const userId = req.user.id;
    const { conversationId, memberId } = req.params;

    try {
        const success = await conversationModel.removeMemberFromConversation(conversationId, userId, parseInt(memberId));

        if (!success) {
            return res.status(404).json({ message: "Member not found in conversation" });
        }

        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error("Error removing member:", error);
        if (error.message.includes("Permission denied") || error.message.includes("Only admin")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Rời khỏi conversation
async function leaveConversation(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        const success = await conversationModel.removeMemberFromConversation(conversationId, userId, userId);

        if (!success) {
            return res.status(404).json({ message: "You are not a member of this conversation" });
        }

        return res.status(200).json({
            message: "Left conversation successfully",
        });
    } catch (error) {
        console.error("Error leaving conversation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Cập nhật thông tin conversation
async function updateConversation(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { title, avatarUrl, coverGifUrl, label } = req.body;

    try {
        const success = await conversationModel.updateConversation(conversationId, userId, {
            title,
            avatarUrl,
            coverGifUrl,
            label,
        });

        if (!success) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        return res.status(200).json({
            message: "Conversation updated successfully",
        });
    } catch (error) {
        console.error("Error updating conversation:", error);
        if (error.message.includes("Only admin")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Tìm kiếm user để thêm vào conversation
async function searchUsers(req, res) {
    console.log("=== CONTROLLER DEBUG ===");
    console.log("req.url:", req.url);
    console.log("req.query:", req.query);
    console.log("req.query keys:", Object.keys(req.query));
    console.log("req.params:", req.params);
    console.log("========================");

    const { query } = req.query;
    const { q } = req.query; // Thử cả hai cách
    const userId = req.user.id;

    console.log("Extracted query:", query);
    console.log("Extracted q:", q);
    console.log("Final search term:", query || q);

    const searchTerm = query || q;

    if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
            message: "Query must be at least 2 characters long",
            debug: {
                query: query,
                q: q,
                searchTerm: searchTerm,
                length: searchTerm ? searchTerm.length : 0,
            },
        });
    }

    try {
        const db = require("../config/db");
        const [users] = await db.query(
            `
            SELECT id, username, displayName, avatarUrl
            FROM users 
            WHERE (username LIKE ? OR displayName LIKE ?) AND id != ?
            LIMIT 20
        `,
            [`%${searchTerm}%`, `%${searchTerm}%`, userId]
        );

        return res.status(200).json({
            message: "Users found",
            data: users,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createConversation,
    getUserConversations,
    getConversationById,
    addMember,
    removeMember,
    leaveConversation,
    updateConversation,
    searchUsers,
};
