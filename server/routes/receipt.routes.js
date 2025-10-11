const express = require("express");
const router = express.Router();
const receiptController = require("../controller/receipt.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Lấy receipt cho một tin nhắn
router.get("/message/:messageId", receiptController.getMessageReceipts);

// Lấy tất cả tin nhắn chưa đọc
router.get("/unread", receiptController.getUnreadMessages);

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
router.post("/conversation/:conversationId/read-all", receiptController.markAllMessagesAsRead);

// Lấy số tin nhắn chưa đọc theo từng conversation
router.get("/unread-count", receiptController.getUnreadCountByConversation);

module.exports = router;
