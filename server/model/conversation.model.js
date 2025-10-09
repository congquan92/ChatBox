const db = require("../config/db");

// Tạo conversation mới (direct hoặc group)
async function createConversation({ type = "direct", title = null, avatarUrl = null, coverGifUrl = null, label = "Custom", creatorId, memberIds = [] }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Tạo conversation
        const [result] = await connection.query("INSERT INTO conversations (type, title, avatarUrl, coverGifUrl, label) VALUES (?, ?, ?, ?, ?)", [type, title, avatarUrl, coverGifUrl, label]);

        const conversationId = result.insertId;

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

// Lấy danh sách conversation của user
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
                (SELECT COUNT(*) FROM conversation_members WHERE conversationId = c.id) as memberCount
            FROM conversations c
            JOIN conversation_members cm ON c.id = cm.conversationId
            WHERE cm.userId = ?
            ORDER BY c.createdAt DESC
        `,
            [userId]
        );

        // Lấy lastMessage và members cho mỗi conversation
        for (const conversation of rows) {
            // Lấy lastMessage với thông tin sender
            const [lastMessageRows] = await db.query(
                `
                SELECT 
                    m.id,
                    m.content,
                    m.contentType,
                    m.createdAt,
                    u.id as senderId,
                    u.username as senderUsername,
                    u.displayName as senderDisplayName,
                    u.avatarUrl as senderAvatarUrl
                FROM messages m
                JOIN users u ON m.senderId = u.id
                WHERE m.conversationId = ?
                ORDER BY m.createdAt DESC
                LIMIT 1
            `,
                [conversation.id]
            );

            if (lastMessageRows.length > 0) {
                const lastMsg = lastMessageRows[0];
                conversation.lastMessage = {
                    id: lastMsg.id,
                    content: lastMsg.content,
                    messageType: lastMsg.contentType,
                    createdAt: lastMsg.createdAt,
                    sender: {
                        id: lastMsg.senderId,
                        username: lastMsg.senderUsername,
                        displayName: lastMsg.senderDisplayName,
                        avatarUrl: lastMsg.senderAvatarUrl,
                    },
                };
                conversation.lastMessageTime = lastMsg.createdAt;
            } else {
                conversation.lastMessage = null;
                conversation.lastMessageTime = null;
            }

            // Lấy members cho conversation
            const [memberRows] = await db.query(
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
            `,
                [conversation.id]
            );
            conversation.members = memberRows;
        }

        return rows;
    } catch (error) {
        console.error("Error getting user conversations:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết conversation
async function getConversationById(conversationId, userId) {
    try {
        // Kiểm tra user có trong conversation không
        const [memberCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (memberCheck.length === 0) {
            return null; // User không có quyền truy cập
        }

        const [conversationRows] = await db.query("SELECT * FROM conversations WHERE id = ?", [conversationId]);

        if (conversationRows.length === 0) {
            return null;
        }

        // Lấy danh sách members
        const [memberRows] = await db.query(
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
        `,
            [conversationId]
        );

        return {
            ...conversationRows[0],
            members: memberRows,
            userRole: memberCheck[0].role,
        };
    } catch (error) {
        console.error("Error getting conversation by id:", error);
        throw error;
    }
}

// Thêm member vào conversation
async function addMemberToConversation(conversationId, userId, newMemberId, role = "member") {
    try {
        // Kiểm tra user hiện tại có quyền admin không
        const [adminCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ? AND role = 'admin'", [conversationId, userId]);

        if (adminCheck.length === 0) {
            throw new Error("Only admin can add members");
        }

        // Kiểm tra member đã tồn tại chưa
        const [existingMember] = await db.query("SELECT * FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, newMemberId]);

        if (existingMember.length > 0) {
            throw new Error("User is already a member");
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
        // Kiểm tra user hiện tại có quyền admin không hoặc tự remove mình
        const [permissionCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, userId]);

        if (permissionCheck.length === 0) {
            throw new Error("User not in conversation");
        }

        const isAdmin = permissionCheck[0].role === "admin";
        const isSelf = userId === targetMemberId;

        if (!isAdmin && !isSelf) {
            throw new Error("Permission denied");
        }

        const [result] = await db.query("DELETE FROM conversation_members WHERE conversationId = ? AND userId = ?", [conversationId, targetMemberId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error removing member from conversation:", error);
        throw error;
    }
}

// Cập nhật thông tin conversation
async function updateConversation(conversationId, userId, { title, avatarUrl, coverGifUrl, label }) {
    try {
        // Kiểm tra user có quyền admin không
        const [adminCheck] = await db.query("SELECT role FROM conversation_members WHERE conversationId = ? AND userId = ? AND role = 'admin'", [conversationId, userId]);

        if (adminCheck.length === 0) {
            throw new Error("Only admin can update conversation");
        }

        const [result] = await db.query("UPDATE conversations SET title = ?, avatarUrl = ?, coverGifUrl = ?, label = ? WHERE id = ?", [title, avatarUrl, coverGifUrl, label, conversationId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating conversation:", error);
        throw error;
    }
}

// Tìm conversation direct giữa 2 user
async function findDirectConversation(userId1, userId2) {
    try {
        const [rows] = await db.query(
            `
            SELECT c.id, c.type, c.createdAt
            FROM conversations c
            JOIN conversation_members cm1 ON c.id = cm1.conversationId
            JOIN conversation_members cm2 ON c.id = cm2.conversationId
            WHERE c.type = 'direct' 
                AND cm1.userId = ? 
                AND cm2.userId = ?
                AND (SELECT COUNT(*) FROM conversation_members WHERE conversationId = c.id) = 2
        `,
            [userId1, userId2]
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
    addMemberToConversation,
    removeMemberFromConversation,
    updateConversation,
    findDirectConversation,
};
