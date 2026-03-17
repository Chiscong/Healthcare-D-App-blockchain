const express = require("express");
const {
  getAllDoctors,
  searchDoctor,
} = require("../Controller/debugController");

const router = express.Router();

// Debug endpoints - CHỈ DÙNG TRONG DEVELOPMENT
// Liệt kê tất cả bác sĩ
router.get("/debug/doctors", getAllDoctors);

// Tìm kiếm bác sĩ
router.get("/debug/search-doctor", searchDoctor);

module.exports = router;
