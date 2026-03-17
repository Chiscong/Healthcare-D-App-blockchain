# Backend Architecture - MVC Pattern

## 📁 Cấu Trúc Thư Mục

```
backend/
├── configs/                    # Cấu hình chung
│   ├── middleware.js           # Middleware xác thực JWT
│   └── database-init.js        # Khởi tạo MongoDB collections & indexes
│
├── Controller/                 # Logic xử lý (Business Logic)
│   ├── authController.js       # Xử lý đăng ký, đăng nhập
│   ├── appointmentController.js # Xử lý lịch hẹn
│   └── doctorController.js     # Xử lý thông tin bác sĩ
│
├── Models/                     # Định nghĩa cấu trúc dữ liệu
│   ├── userModel.js            # Doctor & Patient models
│   └── appointmentModel.js     # Appointment model
│
├── Routes/                     # Định tuyến API
│   ├── authRoutes.js           # Routes liên quan đến auth
│   ├── appointmentRoutes.js    # Routes liên quan đến lịch hẹn
│   └── doctorRoutes.js         # Routes liên quan đến bác sĩ
│
├── database.js                 # Kết nối MongoDB
├── index.js                    # Entry point (chỉ setup server)
├── ARCHITECTURE.md             # Tài liệu kiến trúc
├── package.json                # Dependencies
├── .env                        # Biến môi trường (GIT ignore)
└── .env.example                # Template cho .env
```

## 🚀 API Endpoints

### Authentication Routes (`/auth*`)

- `POST /register` - Đăng ký tài khoản (Doctor/Patient)
- `POST /login` - Đăng nhập
- `GET /auth-endpoint` - Xác thực token (cần Authorization header)

### Appointment Routes (`/appointments*`)

- `POST /appointments` - Bệnh nhân tạo lịch hẹn (cần auth)
- `GET /appointments/doctor` - Bác sĩ xem danh sách lịch hẹn (cần auth)
- `GET /appointments/patient` - Bệnh nhân xem danh sách lịch hẹn của mình (cần auth) ⭐ **MỚI**
- `PUT /appointments/:id/status` - Bác sĩ cập nhật trạng thái (cần auth)

### Doctor Routes (`/doctor*`)

- `GET /doctor-info/:doctorAddress` - Lấy thông tin bác sĩ

## 💾 MongoDB Collections & Indexes

### ✨ Tự động tạo bởi `database-init.js`

Khi server khởi động, tự động tạo 3 collections với indexes tối ưu:

### 1. **doctor** Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (bcrypt),
  walletAddress: String,
  department: String,
  hospital: String,
  specialization: String,
  createdAt: Date
}
```

**Indexes:**

- `email` (Unique) - Tìm kiếm nhanh theo email
- `walletAddress` (Unique) - Tìm kiếm nhanh theo ví
- `createdAt` - Lọc theo ngày tạo

---

### 2. **patient** Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (bcrypt),
  walletAddress: String,
  age: Number,
  gender: String,
  phone: String,
  address: String,
  createdAt: Date
}
```

**Indexes:**

- `email` (Unique) - Tìm kiếm nhanh theo email
- `walletAddress` (Unique) - Tìm kiếm nhanh theo ví
- `createdAt` - Lọc theo ngày tạo

---

### 3. **appointments** Collection

```javascript
{
  _id: ObjectId,
  patientAddress: String,
  doctorAddress: String,
  date: String (YYYY-MM-DD),
  time: String (HH:mm),
  reason: String,
  status: String ("Pending" | "Accepted" | "Rejected"),
  createdAt: Date
}
```

**Indexes:**

- `doctorAddress` - Tìm lịch hẹn của bác sĩ
- `patientAddress` - Tìm lịch hẹn của bệnh nhân
- `status` - Lọc theo trạng thái
- `createdAt + _id` - Sắp xếp theo ngày tạo mới nhất
- `date + time` - Tìm kiếm theo ngày/giờ khám

---

## 🔐 Bảo Mật

- Mật khẩu được mã hóa bằng **bcrypt**
- JWT tokens được sử dụng để xác thực
- Tất cả endpoints nhạy cảm cần `Authorization: Bearer <token>` header
- Email và Wallet Address là Unique - không trùng lặp

## 💡 Cách Sử Dụng

1. **Cài dependencies:**

   ```bash
   npm install
   ```

2. **Cấu hình .env:**
   - Copy từ `.env.example` sang `.env`
   - Thay đổi các giá trị cần thiết (MongoDB URI, etc.)

3. **Chạy server:**

   ```bash
   npm start
   ```

   Output sẽ hiển thị:

   ```
   ✓ Database connected
   ✓ Collection 'doctor' already exists
   ✓ Collection 'patient' already exists
   ✓ Collection 'appointments' created
   ✓ Indexes created for ...
   ✓ Database initialization completed successfully
   ✓ Server is listening on port 8080
   ```

4. **Kiểm thử API:**
   - Sử dụng Postman hoặc Thunder Client
   - Đăng nhập để lấy JWT token
   - Thêm token vào Authorization header cho các endpoints cần auth

## 📋 Database Initialization Flow

```
Server Start
    ↓
connectDb() → Kết nối MongoDB Atlas
    ↓
initializeCollections() → Tạo collections & indexes
    ├─ doctor collection
    ├─ patient collection
    └─ appointments collection
    ↓
app.listen() → Khởi động server
    ↓
Ready for API requests
```

## 📝 Ghi Chú

- **configs/database-init.js** tự động tạo collections khi server khởi động
- Nếu collection đã tồn tại, nó sẽ skip và chỉ tạo/update indexes
- **Unique indexes** trên email & walletAddress để tránh trùng lặp
- **Composite indexes** trên createdAt+\_id để tối ưu sắp xếp
- Controllers chứa logic xử lý, Routes định tuyến, Models mô tả cấu trúc
- **index.js** chỉ là entry point, KHÔNG chứa business logic
