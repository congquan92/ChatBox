const { Server } = require("socket.io");
const { socketAuth } = require("./authSocket");
const messageModel = require("../model/message.model");
const conversationModel = require("../model/conversation.model");

// Lưu trữ user online và rooms
const onlineUsers = new Map(); // userId -> { socketId, user }
const userSockets = new Map(); // socketId -> userId

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Cấu hình CORS theo nhu cầu
            methods: ["GET", "POST"],
        },
    });

    // Middleware xác thực
    io.use(socketAuth);

    io.on("connection", (socket) => {
        const user = socket.user;
        console.log(`User ${user.username} connected with socket ${socket.id}`);

        // Lưu thông tin user online
        onlineUsers.set(user.id, {
            socketId: socket.id,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
            },
        });
        userSockets.set(socket.id, user.id);

        // Join user vào các conversation rooms
        joinUserConversations(socket, user.id);

        // Thông báo user online cho tất cả bạn bè
        socket.broadcast.emit("user_online", {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
        });

        // === CONVERSATION EVENTS ===

        // Join conversation room
        socket.on("join_conversation", async (data) => {
            try {
                const { conversationId } = data;

                // Kiểm tra user có quyền join conversation không
                const conversation = await conversationModel.getConversationById(conversationId, user.id);
                if (!conversation) {
                    socket.emit("error", { message: "Conversation not found or access denied" });
                    return;
                }

                socket.join(`conversation_${conversationId}`);
                socket.emit("joined_conversation", { conversationId });

                console.log(`User ${user.username} joined conversation ${conversationId}`);
            } catch (error) {
                console.error("Error joining conversation:", error);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // Leave conversation room
        socket.on("leave_conversation", (data) => {
            const { conversationId } = data;
            socket.leave(`conversation_${conversationId}`);
            socket.emit("left_conversation", { conversationId });
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
                    },
                };

                // Broadcast tin nhắn cho tất cả user trong conversation
                io.to(`conversation_${conversationId}`).emit("new_message", messageData);

                console.log(`Message sent by ${user.username} in conversation ${conversationId}`);
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
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

        // Typing indicator
        socket.on("typing_start", (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit("user_typing", {
                conversationId,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                },
            });
        });

        socket.on("typing_stop", (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
                conversationId,
                userId: user.id,
            });
        });

        // === CONVERSATION MANAGEMENT EVENTS ===

        // Tạo conversation mới
        socket.on("create_conversation", async (data) => {
            try {
                const { type, title, memberIds, label } = data;

                const result = await conversationModel.createConversation({
                    type,
                    title,
                    label,
                    creatorId: user.id,
                    memberIds,
                });

                // Join creator vào room mới
                socket.join(`conversation_${result.id}`);

                // Join các member khác vào room nếu họ đang online
                memberIds.forEach((memberId) => {
                    const memberSocket = onlineUsers.get(memberId);
                    if (memberSocket) {
                        io.sockets.sockets.get(memberSocket.socketId)?.join(`conversation_${result.id}`);
                    }
                });

                // Thông báo conversation mới cho tất cả members
                io.to(`conversation_${result.id}`).emit("new_conversation", {
                    conversationId: result.id,
                    type,
                    title,
                    createdBy: {
                        id: user.id,
                        username: user.username,
                        displayName: user.displayName,
                    },
                });
            } catch (error) {
                console.error("Error creating conversation:", error);
                socket.emit("error", { message: "Failed to create conversation" });
            }
        });

        // User được thêm vào conversation
        socket.on("member_added", (data) => {
            const { conversationId, memberId } = data;
            const memberSocket = onlineUsers.get(memberId);
            if (memberSocket) {
                io.sockets.sockets.get(memberSocket.socketId)?.join(`conversation_${conversationId}`);
                io.to(`conversation_${conversationId}`).emit("member_joined", {
                    conversationId,
                    memberId,
                    addedBy: user.id,
                });
            }
        });

        // User rời conversation
        socket.on("member_left", (data) => {
            const { conversationId, memberId } = data;
            const memberSocket = onlineUsers.get(memberId);
            if (memberSocket) {
                io.sockets.sockets.get(memberSocket.socketId)?.leave(`conversation_${conversationId}`);
            }
            io.to(`conversation_${conversationId}`).emit("member_left", {
                conversationId,
                memberId,
            });
        });

        // === ONLINE STATUS ===

        // Lấy danh sách user online
        socket.on("get_online_users", () => {
            const onlineUserList = Array.from(onlineUsers.values()).map((item) => item.user);
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
async function joinUserConversations(socket, userId) {
    try {
        const conversations = await conversationModel.getUserConversations(userId);
        conversations.forEach((conversation) => {
            socket.join(`conversation_${conversation.id}`);
        });
        console.log(`User ${userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
        console.error("Error joining user conversations:", error);
    }
}

// Export functions để sử dụng ở nơi khác
function getOnlineUsers() {
    return Array.from(onlineUsers.values()).map((item) => item.user);
}

function isUserOnline(userId) {
    return onlineUsers.has(userId);
}

function getUserSocket(userId) {
    return onlineUsers.get(userId)?.socketId;
}

module.exports = {
    initializeSocket,
    getOnlineUsers,
    isUserOnline,
    getUserSocket,
};
