const db = require("../config/db");

// Tạo conversation mới (direct hoặc group)
async function createConversation({ type = "direct", title = null, avatarUrl = "https://i.pinimg.com/1200x/e8/c8/1b/e8c81bb7fa1f8ca512355a30f55f24da.jpg", coverGifUrl = null, label = "Custom", creatorId, memberIds = [] }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Tạo conversation
        const [result] = await connection.query("INSERT INTO conversations (type, title, avatarUrl, coverGifUrl, label) VALUES (?, ?, ?, ?, ?)", [type, title, avatarUrl, coverGifUrl, label]);

        const conversationId = result.insertId; // Lấy ID của conversation vừa tạo

        // Thêm creator vào conversation với role admin
        await connection.query("INSERT INTO conversation_members (conversationId, userId, role) VALUES (?, ?, ?)", [conversationId, creatorId, "admin"]);

        // Thêm các member khác với role member
        for (const memberId of memberIds) {
            if (memberId !== creatorId) {
                await connection.query("INSERT INTO conversation_members (conversationId, userId, role) VALUES (?, ?, ?)", [conversationId, memberId, "member"]);
            }
        }

        await connection.commit();
        return { id: conversationId, message: "Conversation created successfully" };
    } catch (error) {
        await connection.rollback();
        console.error("Error creating conversation:", error);
        throw error;
    } finally {
        connection.release();
    }
}

// Lấy tất cả conversation của user
async function getUserConversations(userId) {
    try {
        const [rows] = await db.query(
            `
            SELECT 
                c.id,
                c.type,
                c.title,
                c.avatarUrl,
                c.coverGifUrl,
                c.label,
                c.createdAt,
                cm.role,
                cm.joinedAt,
                (SELECT COUNT(*) FROM conversation_members WHERE conversationId = c.id) as memberCount,
                (SELECT content FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
                (SELECT createdAt FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessageTime,
                (SELECT username FROM users u JOIN messages m ON u.id = m.senderId WHERE m.conversationId = c.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessageSender
            FROM conversations c
            JOIN conversation_members cm ON c.id = cm.conversationId
            WHERE cm.userId = ?
            ORDER BY lastMessageTime DESC, c.createdAt DESC
        `,
            [userId]
        );

        return rows;
    } catch (error) {
        console.error("Error getting user conversations:", error);
        throw error;
    }
}

// Lấy chi tiết conversation
async function getConversationById(conversationId, userId) {
    try {
        // Kiểm tra user có trong conversation không
        const [memberCheck] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            throw new Error("User is not a member of this conversation");
        }

        const [rows] = await db.query(
            `
            SELECT 
                c.id,
                c.type,
                c.title,
                c.avatarUrl,
                c.coverGifUrl,
                c.label,
                c.createdAt
            FROM conversations c
            WHERE c.id = ?
        `,
            [conversationId]
        );

        return rows[0];
    } catch (error) {
        console.error("Error getting conversation by id:", error);
        throw error;
    }
}

// Lấy members của conversation
async function getConversationMembers(conversationId, userId) {
    try {
        // Kiểm tra user có trong conversation không
        const [memberCheck] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            throw new Error("User is not a member of this conversation");
        }

        const [rows] = await db.query(
            `
            SELECT 
                u.id,
                u.username,
                u.displayName,
                u.avatarUrl,
                cm.role,
                cm.joinedAt
            FROM conversation_members cm
            JOIN users u ON cm.userId = u.id
            WHERE cm.conversationId = ?
            ORDER BY cm.joinedAt
        `,
            [conversationId]
        );

        return rows;
    } catch (error) {
        console.error("Error getting conversation members:", error);
        throw error;
    }
}

// Thêm member vào conversation
async function addMemberToConversation(conversationId, userId, newMemberId, role = "member") {
    try {
        // Kiểm tra user có quyền admin không
        const [adminCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
            throw new Error("Only admins can add members");
        }

        // Kiểm tra member đã tồn tại chưa
        const [existingMember] = await db.query("SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, newMemberId]);

        if (existingMember.length > 0) {
            throw new Error("User is already a member of this conversation");
        }

        const [result] = await db.query("INSERT INTO conversation_members (conversationId, userId, role) VALUES (?, ?, ?)", [conversationId, newMemberId, role]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error adding member to conversation:", error);
        throw error;
    }
}

// Xóa member khỏi conversation
async function removeMemberFromConversation(conversationId, userId, targetMemberId) {
    try {
        // Kiểm tra user có quyền admin hoặc tự xóa mình không
        const [memberCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            throw new Error("User is not a member of this conversation");
        }

        const isAdmin = memberCheck[0].role === "admin";
        const isSelf = userId === targetMemberId;

        if (!isAdmin && !isSelf) {
            throw new Error("Only admins can remove other members");
        }

        const [result] = await db.query("DELETE FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, targetMemberId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error removing member from conversation:", error);
        throw error;
    }
}

// Cập nhật thông tin conversation
async function updateConversation(conversationId, userId, updates) {
    try {
        // Kiểm tra user có quyền admin không
        const [adminCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
            throw new Error("Only admins can update conversation");
        }

        const allowedFields = ["title", "avatarUrl", "coverGifUrl", "label"];
        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        }

        if (updateFields.length === 0) {
            throw new Error("No valid fields to update");
        }

        updateValues.push(conversationId);

        const [result] = await db.query(`UPDATE conversations SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating conversation:", error);
        throw error;
    }
}

// Xóa conversation
async function deleteConversation(conversationId, userId) {
    try {
        // Kiểm tra user có quyền admin không
        const [adminCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
            throw new Error("Only admins can delete conversation");
        }

        const [result] = await db.query("DELETE FROM conversations WHERE id = ?", [conversationId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
}

// Tìm conversation giữa 2 user (direct chat)
async function findDirectConversation(user1Id, user2Id) {
    try {
        const [rows] = await db.query(
            `
            SELECT c.* FROM conversations c
            JOIN conversation_members cm1 ON c.id = cm1.conversationId
            JOIN conversation_members cm2 ON c.id = cm2.conversationId
            WHERE c.type = 'direct' 
            AND cm1.userId = ? 
            AND cm2.userId = ?
            AND (
                SELECT COUNT(*) FROM conversation_members 
                WHERE conversationId = c.id
            ) = 2
        `,
            [user1Id, user2Id]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error finding direct conversation:", error);
        throw error;
    }
}

module.exports = {
    createConversation,
    getUserConversations,
    getConversationById,
    getConversationMembers,
    addMemberToConversation,
    removeMemberFromConversation,
    updateConversation,
    deleteConversation,
    findDirectConversation,
};
