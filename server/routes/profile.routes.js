const express = require("express");
const router = express.Router();

const profileController = require("../controller/profile.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/me", authenticateToken, profileController.getProfile);
router.put("/me", authenticateToken, profileController.updateProfile);

// Tìm kiếm user
router.get("/search", authenticateToken, profileController.searchUsers);

// Lấy danh sách tất cả user
router.get("/users", authenticateToken, profileController.getAllUsers);

// Lấy thông tin user theo ID
router.get("/users/:userId", authenticateToken, profileController.getUserById);

module.exports = router;
