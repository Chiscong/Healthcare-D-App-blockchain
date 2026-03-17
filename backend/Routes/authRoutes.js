const express = require("express");
const {
  getAuthEndpoint,
  register,
  login,
} = require("../Controller/authController");
const { authenticateToken } = require("../configs/middleware");

const router = express.Router();

// Auth endpoint - xác thực token
router.get("/auth-endpoint", authenticateToken, getAuthEndpoint);

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

module.exports = router;
