const { Server } = require("socket.io");
const { socketAuth } = require("./authSocket");
const messageModel = require("../model/message.model");
const conversationModel = require("../model/conversation.model");

// Lưu trữ user online và rooms
const onlineUsers = new Map(); // userId -> { socketId, user }
const userSockets = new Map(); // socketId -> userId

// Khởi tạo Socket.IO server
function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Middleware xác thực người dùng khi kết nối
    io.use(socketAuth);

    io.on("connection", async (socket) => {
        const user = socket.user;
        console.log(`✓ User ${user.username} (ID: ${user.id}) connected [Socket: ${socket.id}]`);

        // Lưu thông tin user online
        onlineUsers.set(user.id, {
            socketId: socket.id,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        });
        userSockets.set(socket.id, user.id);

        // Thông báo user online cho tất cả bạn bè
        socket.broadcast.emit("user_online", {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        });

        // === CONVERSATION EVENTS ===

        // Join user vào các conversation rooms
        const t = await joinUserConversations(socket, user.id, user);
        socket.emit("joined_conversation", t); // conversations user đã join cho client

        // Tạo conversation mới
        socket.on("create_conversation", async (data) => {
            try {
                const { type, title, memberIds, avatarUrl, coverGifUrl, label } = data;

                const result = await conversationModel.createConversation({
                    type,
                    title,
                    avatarUrl,
                    coverGifUrl,
                    label,
                    creatorId: user.id,
                    memberIds,
                });

                // Join tất cả members vào room mới
                const allMemberIds = [user.id, ...memberIds];
                const conversationData = {
                    conversation: result,
                    creator: {
                        id: user.id,
                        username: user.username,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl,
                    },
                };

                allMemberIds.forEach((memberId) => {
                    const memberSocket = onlineUsers.get(memberId);
                    if (memberSocket) {
                        io.sockets.sockets.get(memberSocket.socketId)?.join(`conversation_${result.id}`);
                        io.to(memberSocket.socketId).emit("conversation_created", conversationData);
                    }
                });

                console.log(`  → Conversation ${result.id} created by ${user.username}`);
            } catch (error) {
                console.error("Error creating conversation:", error);
                socket.emit("error", { message: "Failed to create conversation", error: error.message });
            }
        });

        // Join conversation room
        socket.on("join_conversation", async (data) => {
            const { conversationId } = data;
            if (!conversationId) {
                socket.emit("error", { message: "conversationId is required" });
                return;
            }

            try {
                // Kiểm tra user có quyền join không
                const isMember = await conversationModel.getConversationById(conversationId, user.id);
                if (isMember) {
                    socket.join(`conversation_${conversationId}`);
                    console.log(`  → User ${user.username} joined conversation ${conversationId}`);
                } else {
                    socket.emit("error", { message: "You are not a member of this conversation" });
                }
            } catch (error) {
                console.error("Error joining conversation:", error);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // Leave conversation room
        socket.on("leave_conversation", (data) => {
            const { conversationId } = data;
            if (!conversationId) {
                socket.emit("error", { message: "conversationId is required" });
                return;
            }
            socket.leave(`conversation_${conversationId}`);
            console.log(`  → User ${user.username} left conversation ${conversationId}`);
        });

        // === MESSAGE EVENTS ===

        // Gửi tin nhắn
        socket.on("send_message", async (data) => {
            try {
                const { conversationId, content, contentType = "text" } = data;

                if (!conversationId || !content) {
                    socket.emit("error", { message: "conversationId and content are required" });
                    return;
                }

                // Gửi tin nhắn qua model
                const result = await messageModel.sendMessage({
                    conversationId,
                    senderId: user.id,
                    content,
                    contentType,
                });

                // Tạo message object để broadcast
                const messageData = {
                    id: result.id,
                    conversationId: result.conversationId,
                    senderId: result.senderId,
                    content: result.content,
                    contentType: result.contentType,
                    createdAt: result.createdAt,
                    sender: {
                        username: user.username,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl,
                    },
                };

                // Broadcast tin nhắn cho tất cả user trong conversation
                io.to(`conversation_${conversationId}`).emit("new_message", messageData);

                console.log(`  → Message sent by ${user.username} in conversation ${conversationId}`);
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message", error: error.message });
            }
        });

        // Chỉnh sửa tin nhắn
        socket.on("edit_message", async (data) => {
            try {
                const { messageId, content } = data;

                if (!messageId || !content) {
                    socket.emit("error", { message: "messageId and content are required" });
                    return;
                }

                const result = await messageModel.editMessage(messageId, user.id, content);

                if (result) {
                    const message = await messageModel.getMessageById(messageId, user.id);
                    if (message) {
                        io.to(`conversation_${message.conversationId}`).emit("message_edited", {
                            messageId,
                            conversationId: message.conversationId,
                            content,
                            editedAt: new Date(),
                            editedBy: {
                                id: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                        });
                        console.log(`  → Message ${messageId} edited by ${user.username}`);
                    }
                } else {
                    socket.emit("error", { message: "Cannot edit this message" });
                }
            } catch (error) {
                console.error("Error editing message:", error);
                socket.emit("error", { message: "Failed to edit message", error: error.message });
            }
        });

        // Xóa tin nhắn
        socket.on("delete_message", async (data) => {
            try {
                const { messageId } = data;

                if (!messageId) {
                    socket.emit("error", { message: "messageId is required" });
                    return;
                }

                const message = await messageModel.getMessageById(messageId, user.id);

                if (message) {
                    const result = await messageModel.deleteMessage(messageId, user.id);

                    if (result) {
                        io.to(`conversation_${message.conversationId}`).emit("message_deleted", {
                            messageId,
                            conversationId: message.conversationId,
                            deletedBy: {
                                id: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                            deletedAt: new Date(),
                        });
                        console.log(`  → Message ${messageId} deleted by ${user.username}`);
                    } else {
                        socket.emit("error", { message: "Cannot delete this message" });
                    }
                } else {
                    socket.emit("error", { message: "Message not found" });
                }
            } catch (error) {
                console.error("Error deleting message:", error);
                socket.emit("error", { message: "Failed to delete message", error: error.message });
            }
        });

        // Đánh dấu tin nhắn đã đọc
        socket.on("mark_message_read", async (data) => {
            try {
                const { messageId } = data;

                if (!messageId) {
                    socket.emit("error", { message: "messageId is required" });
                    return;
                }

                await messageModel.markMessageAsRead(messageId, user.id);

                const message = await messageModel.getMessageById(messageId, user.id);
                if (message) {
                    const senderSocket = onlineUsers.get(message.senderId);
                    if (senderSocket && message.senderId !== user.id) {
                        io.to(senderSocket.socketId).emit("message_read", {
                            messageId,
                            conversationId: message.conversationId,
                            readBy: {
                                userId: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                            timestamp: new Date(),
                        });
                    }
                }
            } catch (error) {
                console.error("Error marking message as read:", error);
                socket.emit("error", { message: "Failed to mark message as read", error: error.message });
            }
        });

        // Người dùng đang gõ
        socket.on("typing_start", (data) => {
            const { conversationId } = data;
            if (!conversationId) {
                socket.emit("error", { message: "conversationId is required" });
                return;
            }
            socket.to(`conversation_${conversationId}`).emit("user_typing", {
                userId: user.id,
                username: user.username,
                displayName: user.displayName,
                conversationId,
            });
        });

        // Người dùng ngừng gõ
        socket.on("typing_stop", (data) => {
            const { conversationId } = data;
            if (!conversationId) {
                socket.emit("error", { message: "conversationId is required" });
                return;
            }
            socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
                userId: user.id,
                username: user.username,
                displayName: user.displayName,
                conversationId,
            });
        });

        // === ONLINE STATUS ===

        // Lấy danh sách user online
        socket.on("get_online_users", () => {
            const onlineUserList = Array.from(onlineUsers.values()).map((item) => item.user);
            console.log(`  → ${user.username} requested online users list (${onlineUserList.length} users)`);
            socket.emit("online_users", onlineUserList);
        });

        // === DISCONNECT ===
        socket.on("disconnect", (reason) => {
            console.log(`✗ User ${user.username} disconnected [Reason: ${reason}]`);

            // Xóa user khỏi danh sách online
            onlineUsers.delete(user.id);
            userSockets.delete(socket.id);

            // Thông báo user offline
            socket.broadcast.emit("user_offline", {
                userId: user.id,
                username: user.username,
            });
        });

        // TEST
        socket.on("test_event", (data) => {
            console.log(data);
        });

        // ERROR HANDLING
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });

    return io;
}

// Helper function để join user vào tất cả conversation rooms
async function joinUserConversations(socket, userId, user) {
    try {
        const conversations = await conversationModel.getUserConversations(userId);
        conversations.forEach((conversation) => {
            socket.join(`conversation_${conversation.id}`);
        });
        console.log(`  → User ${user.username} joined ${conversations.length} conversation rooms`);
        return { user, conversations };
    } catch (error) {
        console.error("✗ Error joining user conversations:", error);
        // return { user, conversations: [] };
    }
}

module.exports = { initializeSocket };
