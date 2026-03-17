const { getDb } = require("../database");

// Lấy danh sách tất cả bác sĩ (chỉ dùng cho DEBUG)
const getAllDoctors = async (req, res) => {
  try {
    const db = getDb();

    const doctors = await db
      .collection("doctor")
      .find({})
      .project({ password: 0 }) // Không trả về password
      .toArray();

    res.status(200).json({
      totalDoctors: doctors.length,
      doctors: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send({
      error: "An error occurred while fetching doctors.",
      details: error.message,
    });
  }
};

// Tìm bác sĩ bằng các tiêu chí khác nhau
const searchDoctor = async (req, res) => {
  const { email, walletAddress, name } = req.query;

  try {
    const db = getDb();
    const query = {};

    if (email) {
      query.email = { $regex: new RegExp(`.*${email}.*`, "i") };
    }
    if (walletAddress) {
      query.walletAddress = walletAddress.toLowerCase();
    }
    if (name) {
      query.name = { $regex: new RegExp(`.*${name}.*`, "i") };
    }

    if (Object.keys(query).length === 0) {
      return res.status(400).send({
        error:
          "Please provide at least one search criteria (email, walletAddress, or name)",
      });
    }

    const doctors = await db
      .collection("doctor")
      .find(query)
      .project({ password: 0 })
      .toArray();

    res.status(200).json({
      found: doctors.length,
      doctors: doctors,
      searchCriteria: query,
    });
  } catch (error) {
    console.error("Error searching doctors:", error);
    res.status(500).send({
      error: "An error occurred while searching doctors.",
      details: error.message,
    });
  }
};

module.exports = { getAllDoctors, searchDoctor };
