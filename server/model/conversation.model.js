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
    } finally {
        connection.release();
    }
}

module.exports = { createConversation };
