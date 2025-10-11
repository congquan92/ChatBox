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
        joinUserConversations(socket, user.id);

        // Thông báo user online cho tất cả bạn bè
        socket.broadcast.emit("user_online", {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        });

        // === CONVERSATION EVENTS ===

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
