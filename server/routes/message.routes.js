const express = require("express");
const router = express.Router();

const messageController = require("../controller/message.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Gửi tin nhắn mới
router.post("/", authenticateToken, messageController.sendMessage);

// Lấy tin nhắn trong conversation
router.get("/conversation/:conversationId", authenticateToken, messageController.getMessages);

// Lấy chi tiết một tin nhắn
router.get("/:messageId", authenticateToken, messageController.getMessageById);

// Chỉnh sửa tin nhắn
router.put("/:messageId", authenticateToken, messageController.editMessage);

// Xóa tin nhắn
router.delete("/:messageId", authenticateToken, messageController.deleteMessage);

// Đánh dấu tin nhắn đã đọc
router.post("/:messageId/read", authenticateToken, messageController.markAsRead);

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
router.post("/conversation/:conversationId/read-all", authenticateToken, messageController.markAllAsRead);

// Lấy số tin nhắn chưa đọc trong conversation
router.get("/conversation/:conversationId/unread-count", authenticateToken, messageController.getUnreadCount);

// Tìm kiếm tin nhắn trong conversation
router.get("/conversation/:conversationId/search", authenticateToken, messageController.searchMessages);

module.exports = router;
