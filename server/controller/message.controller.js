const messageModel = require("../model/message.model");

// Chuẩn hóa dữ liệu message response
function toPublicMessage(message) {
    return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        contentType: message.contentType,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        sender: {
            username: message.username,
            displayName: message.displayName,
            avatarUrl: message.avatarUrl,
        },
    };
}

// Gửi tin nhắn mới
async function sendMessage(req, res) {
    const userId = req.user.id;
    const { conversationId, content, contentType = "text" } = req.body;

    if (!conversationId || !content) {
        return res.status(400).json({ message: "conversationId and content are required" });
    }

    try {
        const result = await messageModel.sendMessage({
            conversationId,
            senderId: userId,
            content,
            contentType,
        });

        return res.status(201).json({
            message: result.message,
            data: {
                id: result.id,
                conversationId: result.conversationId,
                senderId: result.senderId,
                content: result.content,
                contentType: result.contentType,
                createdAt: result.createdAt,
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        if (error.message.includes("not a member")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Lấy tin nhắn trong conversation
async function getMessages(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    try {
        const messages = await messageModel.getMessages(conversationId, userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            before,
        });

        return res.status(200).json({
            message: "Messages retrieved successfully",
            data: messages.map(toPublicMessage),
        });
    } catch (error) {
        console.error("Error getting messages:", error);
        if (error.message.includes("not a member")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Lấy chi tiết một tin nhắn
async function getMessageById(req, res) {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        const message = await messageModel.getMessageById(messageId, userId);

        if (!message) {
            return res.status(404).json({ message: "Message not found or access denied" });
        }

        return res.status(200).json({
            message: "Message retrieved successfully",
            data: toPublicMessage(message),
        });
    } catch (error) {
        console.error("Error getting message:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Chỉnh sửa tin nhắn
async function editMessage(req, res) {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "content is required" });
    }

    try {
        const success = await messageModel.editMessage(messageId, userId, content);

        if (!success) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message updated successfully",
        });
    } catch (error) {
        console.error("Error editing message:", error);
        if (error.message.includes("only edit your own")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Xóa tin nhắn
async function deleteMessage(req, res) {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        const success = await messageModel.deleteMessage(messageId, userId);

        if (!success) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        if (error.message.includes("only delete") || error.message.includes("Permission denied")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Đánh dấu tin nhắn đã đọc
async function markAsRead(req, res) {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        const success = await messageModel.markMessageAsRead(messageId, userId);

        if (!success) {
            return res.status(404).json({ message: "Message not found or already marked as read" });
        }

        return res.status(200).json({
            message: "Message marked as read",
        });
    } catch (error) {
        console.error("Error marking message as read:", error);
        if (error.message.includes("not in conversation")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
async function markAllAsRead(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        const markedCount = await messageModel.markAllMessagesAsRead(conversationId, userId);

        return res.status(200).json({
            message: "All messages marked as read",
            data: { markedCount },
        });
    } catch (error) {
        console.error("Error marking all messages as read:", error);
        if (error.message.includes("not a member")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Lấy số tin nhắn chưa đọc
async function getUnreadCount(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        const unreadCount = await messageModel.getUnreadMessagesCount(conversationId, userId);

        return res.status(200).json({
            message: "Unread count retrieved successfully",
            data: { unreadCount },
        });
    } catch (error) {
        console.error("Error getting unread count:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Tìm kiếm tin nhắn
async function searchMessages(req, res) {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { q: keyword } = req.query;

    if (!keyword || keyword.trim().length < 2) {
        return res.status(400).json({ message: "Search keyword must be at least 2 characters long" });
    }

    try {
        const messages = await messageModel.searchMessages(conversationId, userId, keyword.trim());

        return res.status(200).json({
            message: "Search completed successfully",
            data: messages.map(toPublicMessage),
        });
    } catch (error) {
        console.error("Error searching messages:", error);
        if (error.message.includes("not a member")) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getMessageById,
    editMessage,
    deleteMessage,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    searchMessages,
};
