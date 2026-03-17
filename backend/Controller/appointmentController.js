const { getDb } = require("../database");
const { ObjectId } = require("mongodb");

// Tạo lịch hẹn mới (Bệnh nhân tạo)
const createAppointment = async (req, res) => {
  try {
    const db = getDb();
    let { doctorAddress, date, time, reason } = req.body;
    let patientAddress = req.user.userData.walletAddress; // Lấy từ token

    // Normalize Ethereum addresses (lowercase)
    doctorAddress = doctorAddress.toLowerCase();
    patientAddress = patientAddress.toLowerCase();

    // Validate doctor exists
    const doctorExists = await db.collection("doctor").findOne({
      walletAddress: doctorAddress,
    });

    if (!doctorExists) {
      return res.status(400).send({
        error: "Doctor does not exist in the system.",
      });
    }

    const newAppointment = {
      patientAddress,
      doctorAddress,
      date,
      time,
      reason,
      status: "Pending", // Trạng thái mặc định: Chờ xác nhận
      createdAt: new Date(),
    };

    await db.collection("appointments").insertOne(newAppointment);
    console.log(
      `[DEBUG] Appointment created: ${patientAddress} -> ${doctorAddress}`,
    );
    res.status(200).json({ success: "Appointment created successfully." });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).send({
      error: "An error occurred while creating appointment.",
      details: error.message,
    });
  }
};

// Lấy danh sách lịch hẹn (Bác sĩ xem)
const getDoctorAppointments = async (req, res) => {
  try {
    const db = getDb();
    let doctorAddress = req.user.userData.walletAddress; // Lấy từ token bác sĩ

    // Normalize address (lowercase)
    doctorAddress = doctorAddress.toLowerCase();

    const appointments = await db
      .collection("appointments")
      .find({ doctorAddress })
      .sort({ createdAt: -1 }) // Sắp xếp ngày tạo mới nhất lên đầu
      .toArray();

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send({
      error: "An error occurred while fetching appointments.",
      details: error.message,
    });
  }
};

// Cập nhật trạng thái lịch hẹn (Bác sĩ chấp nhận/từ chối)
const updateAppointmentStatus = async (req, res) => {
  try {
    const db = getDb();
    const appointmentId = req.params.id;
    const { status } = req.body; // status sẽ là 'Accepted' hoặc 'Rejected'

    await db
      .collection("appointments")
      .updateOne(
        { _id: new ObjectId(appointmentId) },
        { $set: { status: status } },
      );

    res
      .status(200)
      .json({ success: `Appointment ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).send({ error: "An error occurred while updating status." });
  }
};

// Lấy danh sách lịch hẹn (Bệnh nhân xem)
const getPatientAppointments = async (req, res) => {
  try {
    const db = getDb();
    let patientAddress = req.user.userData.walletAddress; // Lấy từ token bệnh nhân

    // Normalize address (lowercase)
    patientAddress = patientAddress.toLowerCase();

    const appointments = await db
      .collection("appointments")
      .find({ patientAddress })
      .sort({ createdAt: -1 }) // Sắp xếp ngày tạo mới nhất lên đầu
      .toArray();

    // Lấy thông tin bác sĩ cho mỗi lịch hẹn
    const appointmentsWithDoctorInfo = await Promise.all(
      appointments.map(async (appt) => {
        const doctor = await db.collection("doctor").findOne({
          walletAddress: appt.doctorAddress,
        });
        return {
          ...appt,
          doctorInfo: doctor
            ? {
                name: doctor.name,
                email: doctor.email,
                hospital: doctor.hospital,
                department: doctor.department,
              }
            : null,
        };
      }),
    );

    res.status(200).json(appointmentsWithDoctorInfo);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).send({
      error: "An error occurred while fetching appointments.",
      details: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
};
