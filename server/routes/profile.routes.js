const express = require('express');
const router = express.Router();

const profileController = require("../controller/profile.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/me", authenticateToken, profileController.getProfile);
router.put("/me", authenticateToken, profileController.updateProfile);

module.exports = router;