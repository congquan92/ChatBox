const messageModel = require("../model/message.model");

// Gửi tin nhắn
async function sendMessage(req, res) {
    try {
        const { conversationId, content, contentType = "text" } = req.body;
        const senderId = req.user.id;

        if (!conversationId || !content) {
            return res.status(400).json({ message: "conversationId and content are required" });
        }

        const result = await messageModel.sendMessage({
            conversationId,
            senderId,
            content,
            contentType,
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error sending message:", error);
        if (error.message === "Người dùng không thuộc cuộc trò chuyện này") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy tin nhắn trong conversation
async function getMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 50, before } = req.query;

        const messages = await messageModel.getMessages(conversationId, userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            before,
        });

        return res.status(200).json({ messages });
    } catch (error) {
        console.error("Error getting messages:", error);
        if (error.message === "User is not a member of this conversation") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy chi tiết một tin nhắn
async function getMessageById(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await messageModel.getMessageById(messageId, userId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Error getting message:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Chỉnh sửa tin nhắn
async function editMessage(req, res) {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const result = await messageModel.editMessage(messageId, userId, content);

        if (result) {
            return res.status(200).json({ message: "Message edited successfully" });
        } else {
            return res.status(400).json({ error: "Failed to edit message" });
        }
    } catch (error) {
        console.error("Error editing message:", error);
        if (error.message.includes("Message not found") || error.message.includes("chỉnh sửa tin nhắn")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Xóa tin nhắn
async function deleteMessage(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const result = await messageModel.deleteMessage(messageId, userId);

        if (result) {
            return res.status(200).json({ message: "Message deleted successfully" });
        } else {
            return res.status(400).json({ error: "Failed to delete message" });
        }
    } catch (error) {
        console.error("Error deleting message:", error);
        if (error.message.includes("Message not found") || error.message.includes("You can only delete")) {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Đánh dấu tin nhắn đã đọc
async function markMessageAsRead(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const result = await messageModel.markMessageAsRead(messageId, userId);

        if (result) {
            return res.status(200).json({ message: "Message marked as read" });
        } else {
            return res.status(400).json({ error: "Failed to mark message as read" });
        }
    } catch (error) {
        console.error("Error marking message as read:", error);
        if (error.message === "User not in conversation") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getMessageById,
    editMessage,
    deleteMessage,
    markMessageAsRead,
};
