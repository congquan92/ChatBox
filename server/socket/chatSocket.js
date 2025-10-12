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
        cors: { origin: "*", methods: ["GET", "POST"], credentials: true }, // Cấu hình CORS nếu cần
    });

    // Middleware xác thực người dùng khi kết nối
    io.use(socketAuth);

    io.on("connection", (socket) => {
        const user = socket.user; // Lấy thông tin user từ middleware xác thực
        console.log(`user ${user.username} connected with socket ${socket.id}`);

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

        // Join user vào các conversation rooms
        joinUserConversations(socket, user.id, user);

        // Thông báo user online cho tất cả bạn bè
        socket.broadcast.emit("user_online", {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        });

        // === CONVERSATION EVENTS ===

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
                allMemberIds.forEach((memberId) => {
                    const memberSocket = onlineUsers.get(memberId);
                    if (memberSocket) {
                        io.to(memberSocket.socketId).join(`conversation_${result.id}`);
                        io.to(memberSocket.socketId).emit("conversation_created", {
                            conversation: result,
                            creator: {
                                id: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                        });
                    }
                });

                console.log(`Conversation ${result.id} created by ${user.username}`);
            } catch (error) {
                console.error("Error creating conversation:", error);
                socket.emit("error", { message: "Failed to create conversation" });
            }
        });

        // Join conversation room
        socket.on("join_conversation", (data) => {
            const { conversationId } = data;
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${user.username} joined conversation ${conversationId}`);
        });

        // Leave conversation room
        socket.on("leave_conversation", (data) => {
            const { conversationId } = data;
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${user.username} left conversation ${conversationId}`);
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

                //emit là gửi tin nhắn đến tất cả user trong room nên ta giới hạn phạm vi bằng .to("tên_phòng")

                // Broadcast tin nhắn cho tất cả user trong conversation
                io.to(`conversation_${conversationId}`).emit("new_message", messageData); // Gửi tin nhắn đến tất cả user trong coversation_123

                console.log(`Message sent by ${user.username} in conversation ${conversationId}`);
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Chỉnh sửa tin nhắn
        socket.on("edit_message", async (data) => {
            try {
                const { messageId, content } = data;

                const result = await messageModel.editMessage(messageId, user.id, content);

                if (result) {
                    const message = await messageModel.getMessageById(messageId, user.id);
                    if (message) {
                        // Broadcast tin nhắn đã chỉnh sửa
                        io.to(`conversation_${message.conversationId}`).emit("message_edited", {
                            messageId,
                            content,
                            editedAt: new Date(),
                            editedBy: {
                                id: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                        });
                    }
                }
            } catch (error) {
                console.error("Error editing message:", error);
                socket.emit("error", { message: "Failed to edit message" });
            }
        });

        // Xóa tin nhắn
        socket.on("delete_message", async (data) => {
            try {
                const { messageId } = data;

                // Lấy thông tin message trước khi xóa
                const message = await messageModel.getMessageById(messageId, user.id);

                if (message) {
                    const result = await messageModel.deleteMessage(messageId, user.id);

                    if (result) {
                        // Broadcast tin nhắn đã xóa
                        io.to(`conversation_${message.conversationId}`).emit("message_deleted", {
                            messageId,
                            deletedBy: {
                                id: user.id,
                                username: user.username,
                                displayName: user.displayName,
                                avatarUrl: user.avatarUrl,
                            },
                            deletedAt: new Date(),
                        });
                    }
                }
            } catch (error) {
                console.error("Error deleting message:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });

        // Đánh dấu tin nhắn đã đọc
        socket.on("mark_message_read", async (data) => {
            try {
                const { messageId } = data;

                await messageModel.markMessageAsRead(messageId, user.id);

                // Thông báo cho người gửi biết tin nhắn đã được đọc
                const message = await messageModel.getMessageById(messageId, user.id);
                if (message) {
                    const senderSocket = onlineUsers.get(message.senderId);
                    if (senderSocket) {
                        io.to(senderSocket.socketId).emit("message_read", {
                            messageId,
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
                socket.emit("error", { message: "Failed to mark message as read" });
            }
        });

        // Người dùng đang gõ
        socket.on("typing_start", (data) => {
            const { conversationId } = data;
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
            console.log(` user yêu cầu danh sách online : ${user.username}:`, onlineUserList);
            socket.emit("online_users", onlineUserList);
        });

        // === DISCONNECT ===
        socket.on("disconnect", () => {
            console.log(`User ${user.username} disconnected`);

            // Xóa user khỏi danh sách online
            onlineUsers.delete(user.id);
            userSockets.delete(socket.id);

            // Thông báo user offline
            socket.broadcast.emit("user_offline", {
                userId: user.id,
                username: user.username,
            });
        });

        // Error handling
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
        console.log(`user ${user.username}(${user.id}) joined ${conversations.length} conversation rooms`);
    } catch (error) {
        console.error("Error joining user conversations:", error);
    }
}

module.exports = { initializeSocket };
