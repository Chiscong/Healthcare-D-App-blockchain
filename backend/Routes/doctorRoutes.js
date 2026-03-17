const express = require("express");
const { getDoctorInfo } = require("../Controller/doctorController");

const router = express.Router();

// Lấy thông tin bác sĩ
router.get("/doctor-info/:doctorAddress", getDoctorInfo);

module.exports = router;
