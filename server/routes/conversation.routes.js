const express = require("express");
const router = express.Router();
const conversationController = require("../controller/conversation.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Tạo conversation mới
router.post("/", conversationController.createConversation);

// Lấy tất cả conversation của user
router.get("/", conversationController.getUserConversations);

// Lấy chi tiết conversation
router.get("/:conversationId", conversationController.getConversationById);

// Cập nhật thông tin conversation
router.put("/:conversationId", conversationController.updateConversation);

// Xóa conversation
router.delete("/:conversationId", conversationController.deleteConversation);

// Thêm member vào conversation
router.post("/:conversationId/members", conversationController.addMember);

// Xóa member khỏi conversation
router.delete("/:conversationId/members/:memberId", conversationController.removeMember);

// Rời khỏi conversation
router.post("/:conversationId/leave", conversationController.leaveConversation);

module.exports = router;
