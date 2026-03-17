const express = require("express");
const {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} = require("../Controller/appointmentController");
const { authenticateToken } = require("../configs/middleware");

const router = express.Router();

// Tạo lịch hẹn mới (Bệnh nhân)
router.post("/appointments", authenticateToken, createAppointment);

// Lấy danh sách lịch hẹn (Bác sĩ)
router.get("/appointments/doctor", authenticateToken, getDoctorAppointments);

// Lấy danh sách lịch hẹn (Bệnh nhân)
router.get("/appointments/patient", authenticateToken, getPatientAppointments);

// Cập nhật trạng thái lịch hẹn (Bác sĩ)
router.put(
  "/appointments/:id/status",
  authenticateToken,
  updateAppointmentStatus,
);

module.exports = router;
