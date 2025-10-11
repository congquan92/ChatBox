const db = require("../config/db");

// Lấy receipt cho một tin nhắn
async function getMessageReceipts(messageId, userId) {
    try {
        // Kiểm tra user có quyền xem receipt không (phải là thành viên conversation)
        const [memberCheck] = await db.query(
            `
            SELECT cm.userId 
            FROM messages m
            JOIN conversation_members cm ON m.conversationId = cm.conversationId
            WHERE m.id = ? AND cm.userId = ?
        `,
            [messageId, userId]
        );

        if (memberCheck.length === 0) {
            throw new Error("User not in conversation");
        }

        const [rows] = await db.query(
            `
            SELECT 
                mr.messageId,
                mr.userId,
                mr.status,
                mr.timestamp,
                u.username,
                u.displayName,
                u.avatarUrl
            FROM message_receipts mr
            JOIN users u ON mr.userId = u.id
            WHERE mr.messageId = ?
            ORDER BY mr.timestamp
        `,
            [messageId]
        );

        return rows;
    } catch (error) {
        console.error("Error getting message receipts:", error);
        throw error;
    }
}

// Lấy tất cả tin nhắn chưa đọc của user
async function getUnreadMessages(userId) {
    try {
        const [rows] = await db.query(
            `
            SELECT 
                m.id,
                m.conversationId,
                m.senderId,
                m.content,
                m.contentType,
                m.createdAt,
                u.username as senderUsername,
                u.displayName as senderDisplayName,
                u.avatarUrl as senderAvatarUrl,
                c.title as conversationTitle,
                c.type as conversationType
            FROM messages m
            JOIN users u ON m.senderId = u.id
            JOIN conversations c ON m.conversationId = c.id
            JOIN conversation_members cm ON m.conversationId = cm.conversationId
            LEFT JOIN message_receipts mr ON m.id = mr.messageId AND mr.userId = ?
            WHERE cm.userId = ? 
            AND m.senderId != ? 
            AND (mr.status IS NULL OR mr.status != 'read')
            ORDER BY m.createdAt DESC
        `,
            [userId, userId, userId]
        );

        return rows;
    } catch (error) {
        console.error("Error getting unread messages:", error);
        throw error;
    }
}

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
async function markAllMessagesAsRead(conversationId, userId) {
    try {
        // Kiểm tra user có trong conversation không
        const [memberCheck] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            throw new Error("User not in conversation");
        }

        // Lấy tất cả tin nhắn chưa đọc trong conversation
        const [unreadMessages] = await db.query(
            `
            SELECT m.id
            FROM messages m
            LEFT JOIN message_receipts mr ON m.id = mr.messageId AND mr.userId = ?
            WHERE m.conversationId = ? 
            AND m.senderId != ?
            AND (mr.status IS NULL OR mr.status != 'read')
        `,
            [userId, conversationId, userId]
        );

        // Đánh dấu tất cả đã đọc
        for (const message of unreadMessages) {
            await db.query(
                `
                INSERT INTO message_receipts (messageId, userId, status) 
                VALUES (?, ?, 'read')
                ON DUPLICATE KEY UPDATE status = 'read', timestamp = CURRENT_TIMESTAMP
            `,
                [message.id, userId]
            );
        }

        return unreadMessages.length;
    } catch (error) {
        console.error("Error marking all messages as read:", error);
        throw error;
    }
}

// Đếm số tin nhắn chưa đọc theo conversation
async function getUnreadCountByConversation(userId) {
    try {
        const [rows] = await db.query(
            `
            SELECT 
                m.conversationId,
                COUNT(*) as unreadCount
            FROM messages m
            JOIN conversation_members cm ON m.conversationId = cm.conversationId
            LEFT JOIN message_receipts mr ON m.id = mr.messageId AND mr.userId = ?
            WHERE cm.userId = ? 
            AND m.senderId != ? 
            AND (mr.status IS NULL OR mr.status != 'read')
            GROUP BY m.conversationId
        `,
            [userId, userId, userId]
        );

        return rows;
    } catch (error) {
        console.error("Error getting unread count by conversation:", error);
        throw error;
    }
}

module.exports = {
    getMessageReceipts,
    getUnreadMessages,
    markAllMessagesAsRead,
    getUnreadCountByConversation,
};
