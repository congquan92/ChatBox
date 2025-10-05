const express = require("express");
const router = express.Router();

const conversationController = require("../controller/conversation.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Lấy danh sách conversation của user
router.get("/", authenticateToken, conversationController.getUserConversations);

// Tạo conversation mới
router.post("/", authenticateToken, conversationController.createConversation);

// Lấy thông tin chi tiết conversation
router.get("/:conversationId", authenticateToken, conversationController.getConversationById);

// Cập nhật thông tin conversation
router.put("/:conversationId", authenticateToken, conversationController.updateConversation);

// Thêm member vào conversation
router.post("/:conversationId/members", authenticateToken, conversationController.addMember);

// Xóa member khỏi conversation
router.delete("/:conversationId/members/:memberId", authenticateToken, conversationController.removeMember);

// Rời khỏi conversation
router.post("/:conversationId/leave", authenticateToken, conversationController.leaveConversation);

// Tìm kiếm user để thêm vào conversation
router.get("/search/users", authenticateToken, conversationController.searchUsers);

module.exports = router;
