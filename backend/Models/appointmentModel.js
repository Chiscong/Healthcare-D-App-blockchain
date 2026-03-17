/**
 * Appointment Model - Định nghĩa cấu trúc dữ liệu lịch hẹn
 *
 * Database Collection: "appointments"
 */

const AppointmentModel = {
  _id: String, // MongoDB ObjectId tự động
  patientAddress: String, // Wallet của bệnh nhân
  doctorAddress: String, // Wallet của bác sĩ
  date: String, // Ngày khám (format: YYYY-MM-DD)
  time: String, // Giờ khám (format: HH:mm)
  reason: String, // Lý do đến khám
  status: String, // "Pending", "Accepted", "Rejected"
  createdAt: Date, // Thời gian tạo lịch hẹn
};

module.exports = { AppointmentModel };
