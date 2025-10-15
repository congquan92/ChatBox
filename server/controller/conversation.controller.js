const conversationModel = require("../model/conversation.model");

// Tạo conversation mới
async function createConversation(req, res) {
    try {
        const { type, title, avatarUrl, coverGifUrl, label, memberIds } = req.body;
        const creatorId = req.user.id;

        if (type === "direct" && memberIds.length !== 1) {
            return res.status(400).json({ message: "Direct conversation must have exactly 1 other member" });
        }

        // Kiểm tra nếu là direct chat, có tồn tại conversation giữa 2 user chưa
        if (type === "direct") {
            const existingConversation = await conversationModel.findDirectConversation(creatorId, memberIds[0]);
            if (existingConversation) {
                return res.status(200).json({
                    message: "Direct conversation already exists",
                    conversation: existingConversation,
                });
            }
        }

        const result = await conversationModel.createConversation({
            type,
            title,
            avatarUrl,
            coverGifUrl,
            label,
            creatorId,
            memberIds,
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error creating conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy tất cả conversation của user
async function getUserConversations(req, res) {
    try {
        const userId = req.user.id;
        const conversations = await conversationModel.getUserConversations(userId);
        for (const i of conversations) {
            const t = await conversationModel.getConversationMembers(i.id, userId);
            i.members = t;
        }

        // const members = await conversationModel.getConversationMembers(1, userId);
        return res.status(200).json({ conversations });
    } catch (error) {
        console.error("Error getting user conversations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy chi tiết conversation
async function getConversationById(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await conversationModel.getConversationById(conversationId, userId);
        const members = await conversationModel.getConversationMembers(conversationId, userId);

        return res.status(200).json({
            conversation: {
                ...conversation,
                members,
            },
        });
    } catch (error) {
        console.error("Error getting conversation:", error);
        if (error.message === "User is not a member of this conversation") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Thêm member vào conversation
async function addMember(req, res) {
    try {
        const { conversationId } = req.params;
        const { userId: newMemberId, role = "member" } = req.body;
        const userId = req.user.id;

        const result = await conversationModel.addMemberToConversation(conversationId, userId, newMemberId, role);

        if (result) {
            return res.status(200).json({ message: "Member added successfully" });
        } else {
            return res.status(400).json({ error: "Failed to add member" });
        }
    } catch (error) {
        console.error("Error adding member:", error);
        if (error.message.includes("Only admins") || error.message.includes("already a member")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Xóa member khỏi conversation
async function removeMember(req, res) {
    try {
        const { conversationId, memberId } = req.params;
        const userId = req.user.id;

        const result = await conversationModel.removeMemberFromConversation(conversationId, userId, memberId);

        if (result) {
            return res.status(200).json({ message: "Member removed successfully" });
        } else {
            return res.status(400).json({ error: "Failed to remove member" });
        }
    } catch (error) {
        console.error("Error removing member:", error);
        if (error.message.includes("Only admins")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Cập nhật thông tin conversation
async function updateConversation(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const result = await conversationModel.updateConversation(conversationId, userId, updates);

        if (result) {
            return res.status(200).json({ message: "Conversation updated successfully" });
        } else {
            return res.status(400).json({ error: "Failed to update conversation" });
        }
    } catch (error) {
        console.error("Error updating conversation:", error);
        if (error.message.includes("Only admins")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Xóa conversation
async function deleteConversation(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const result = await conversationModel.deleteConversation(conversationId, userId);

        if (result) {
            return res.status(200).json({ message: "Conversation deleted successfully" });
        } else {
            return res.status(400).json({ error: "Failed to delete conversation" });
        }
    } catch (error) {
        console.error("Error deleting conversation:", error);
        if (error.message.includes("Only admins")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Rời khỏi conversation
async function leaveConversation(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const result = await conversationModel.removeMemberFromConversation(conversationId, userId, userId);

        if (result) {
            return res.status(200).json({ message: "Left conversation successfully" });
        } else {
            return res.status(400).json({ error: "Failed to leave conversation" });
        }
    } catch (error) {
        console.error("Error leaving conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    createConversation,
    getUserConversations,
    getConversationById,
    addMember,
    removeMember,
    updateConversation,
    deleteConversation,
    leaveConversation,
};
