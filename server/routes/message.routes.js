const express = require("express");
const router = express.Router();
const messageController = require("../controller/message.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Gửi tin nhắn
router.post("/", messageController.sendMessage);

// Lấy tin nhắn trong conversation
router.get("/conversation/:conversationId", messageController.getMessages);

// Lấy chi tiết một tin nhắn
router.get("/:messageId", messageController.getMessageById);

// Chỉnh sửa tin nhắn
router.put("/:messageId", messageController.editMessage);

// Xóa tin nhắn
router.delete("/:messageId", messageController.deleteMessage);

// Đánh dấu tin nhắn đã đọc
router.post("/:messageId/read", messageController.markMessageAsRead);

module.exports = router;
