const receiptModel = require("../model/receipt.model");

// Lấy receipt cho một tin nhắn
async function getMessageReceipts(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const receipts = await receiptModel.getMessageReceipts(messageId, userId);
        return res.status(200).json({ receipts });
    } catch (error) {
        console.error("Error getting message receipts:", error);
        if (error.message === "User not in conversation") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy tất cả tin nhắn chưa đọc
async function getUnreadMessages(req, res) {
    try {
        const userId = req.user.id;
        const unreadMessages = await receiptModel.getUnreadMessages(userId);
        return res.status(200).json({ unreadMessages });
    } catch (error) {
        console.error("Error getting unread messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
async function markAllMessagesAsRead(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const markedCount = await receiptModel.markAllMessagesAsRead(conversationId, userId);
        return res.status(200).json({
            message: "All messages marked as read",
            markedCount,
        });
    } catch (error) {
        console.error("Error marking all messages as read:", error);
        if (error.message === "User not in conversation") {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Lấy số tin nhắn chưa đọc theo từng conversation
async function getUnreadCountByConversation(req, res) {
    try {
        const userId = req.user.id;
        const unreadCounts = await receiptModel.getUnreadCountByConversation(userId);
        return res.status(200).json({ unreadCounts });
    } catch (error) {
        console.error("Error getting unread count by conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getMessageReceipts,
    getUnreadMessages,
    markAllMessagesAsRead,
    getUnreadCountByConversation,
};
