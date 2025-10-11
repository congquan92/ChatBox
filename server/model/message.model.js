const db = require("../config/db");

//Gửi tin nhắn
async function sendMessage({ conversationId, senderId, content, contentType = "text" }) {
    try {
        // Kiểm tra user có trong conversation không ( check xem đối tượng gửi nhắn là ai)
        const [memberCheck] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, senderId]);
        console.log(memberCheck);
        if (memberCheck.length === 0) {
            throw new Error("Người dùng không thuộc cuộc trò chuyện này");
        }
        // Thêm tin nhắn vào bảng messages
        const [result] = await db.query("INSERT INTO messages (conversationId, senderId, content, contentType) VALUES (?, ?, ?, ?)", [conversationId, senderId, content, contentType]);
        return {
            id: result.insertId,
            conversationId,
            senderId,
            content,
            contentType,
            createdAt: new Date(),
            message: "Message sent successfully",
        };
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn (sendMessage):", error);
    }
}

// Lấy tin nhắn trong conversation với phân trang
async function getMessages(conversationId, userId, { page = 1, limit = 50, before = null } = {}) {
    try {
        // Kiểm tra user có trong conversation không
        const [memberCheck] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            throw new Error("User is not a member of this conversation");
        }

        let query = `
            SELECT 
                m.id,
                m.conversationId,
                m.senderId,
                m.content,
                m.contentType,
                m.createdAt,
                m.editedAt,
                u.username,
                u.displayName,
                u.avatarUrl
            FROM messages m
            JOIN users u ON m.senderId = u.id
            WHERE m.conversationId = ?
        `;

        const queryParams = [conversationId];

        // Nếu có before, lấy tin nhắn trước thời điểm đó
        if (before) {
            query += " AND m.createdAt < ?";
            queryParams.push(before);
        }

        query += " ORDER BY m.createdAt DESC LIMIT ?";
        queryParams.push(limit);

        const [rows] = await db.query(query, queryParams);

        // Reverse để có thứ tự từ cũ đến mới
        return rows.reverse();
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
}

// Lấy chi tiết một tin nhắn
async function getMessageById(messageId, userId) {
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
                m.editedAt,
                u.username,
                u.displayName,
                u.avatarUrl
            FROM messages m
            JOIN users u ON m.senderId = u.id
            JOIN conversation_members cm ON m.conversationId = cm.conversationId
            WHERE m.id = ? AND cm.userId = ?
        `,
            [messageId, userId]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error getting message by id:", error);
    }
}
// Chỉnh sửa tin nhắn
async function editMessage(messageId, userId, newContent) {
    try {
        // Kiểm tra tin nhắn có tồn tại và user có quyền chỉnh sửa không
        const [messageCheck] = await db.query("SELECT senderId, conversationId FROM messages WHERE id = ?", [messageId]);

        if (messageCheck.length === 0) {
            throw new Error("Message not found");
        }

        if (messageCheck[0].senderId !== userId) {
            throw new Error("Mày chỉ có thể chỉnh sửa tin nhắn của chính mình thôi nhé!");
        }

        const [result] = await db.query("UPDATE messages SET content = ?, editedAt = CURRENT_TIMESTAMP WHERE id = ?", [newContent, messageId]);

        return result.affectedRows > 0; // true or false
    } catch (error) {
        console.error("Error editing message:", error);
        throw error;
    }
}

// Xóa tin nhắn
async function deleteMessage(messageId, userId) {
    try {
        // Kiểm tra tin nhắn có tồn tại và user có quyền xóa không
        const [messageCheck] = await db.query(
            `
            SELECT m.senderId, m.conversationId, cm.role
            FROM messages m
            JOIN conversation_members cm ON m.conversationId = cm.conversationId
            WHERE m.id = ? AND cm.userId = ?
        `,
            [messageId, userId]
        );

        if (messageCheck.length === 0) {
            throw new Error("Message not found or no permission");
        }

        const isOwner = messageCheck[0].senderId === userId;
        // const isAdmin = messageCheck[0].role === "admin";

        if (!isOwner) {
            throw new Error("You can only delete your own messages");
        }

        const [result] = await db.query("DELETE FROM messages WHERE id = ?", [messageId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
}

// Đánh dấu tin nhắn đã đọc
async function markMessageAsRead(messageId, userId) {
    try {
        // Kiểm tra user có trong conversation không
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

        // Insert hoặc update receipt
        const [result] = await db.query(
            `
            INSERT INTO message_receipts (messageId, userId, status) 
            VALUES (?, ?, 'read')
            ON DUPLICATE KEY UPDATE status = 'read', timestamp = CURRENT_TIMESTAMP
        `,
            [messageId, userId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
    }
}

module.exports = { sendMessage, editMessage, deleteMessage, getMessages, getMessageById, markMessageAsRead };
