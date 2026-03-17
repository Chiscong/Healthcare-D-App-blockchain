/**
 * User Models - Định nghĩa cấu trúc dữ liệu cho Doctor và Patient
 *
 * Database Collections:
 * - "doctor" - Thông tin bác sĩ
 * - "patient" - Thông tin bệnh nhân
 */

// Doctor Model
const DoctorModel = {
  name: String,
  email: String,
  password: String, // Đã mã hóa bằng bcrypt
  walletAddress: String, // MetaMask wallet
  department: String, // Chuyên khoa
  hospital: String, // Bệnh viện
  specialization: String, // Chuyên môn chi tiết
  createdAt: Date,
};

// Patient Model
const PatientModel = {
  name: String,
  email: String,
  password: String, // Đã mã hóa bằng bcrypt
  walletAddress: String, // MetaMask wallet
  age: Number,
  gender: String,
  phone: String,
  address: String,
  createdAt: Date,
};

module.exports = { DoctorModel, PatientModel };
