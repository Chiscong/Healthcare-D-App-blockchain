const { getDb } = require("../database");

// Lấy thông tin bác sĩ
const getDoctorInfo = async (req, res) => {
  let { doctorAddress } = req.params;

  try {
    // Normalize Ethereum address (convert to lowercase để tránh case-sensitive issues)
    if (doctorAddress) {
      doctorAddress = doctorAddress.toLowerCase();
    }

    const db = getDb();

    // Thử tìm với lowercase address
    let doctorExists = await db
      .collection("doctor")
      .findOne({ walletAddress: doctorAddress.toLowerCase() });

    // Nếu không tìm thấy, thử tìm với address gốc (case-insensitive query)
    if (!doctorExists) {
      doctorExists = await db.collection("doctor").findOne({
        walletAddress: { $regex: new RegExp(`^${doctorAddress}$`, "i") },
      });
    }

    if (!doctorExists) {
      console.log(`[DEBUG] Doctor not found with address: ${doctorAddress}`);
      return res.status(400).send({
        error:
          "Doctor does not exist. Please ensure the wallet address is correct.",
        debugInfo: { searchedAddress: doctorAddress },
      });
    }

    console.log(`[DEBUG] Doctor found: ${doctorExists.email}`);
    res.status(200).json(doctorExists);
  } catch (error) {
    console.error("Error getting doctor info:", error);
    res.status(500).send({
      error: "An error occurred while getting doctor info.",
      details: error.message,
    });
  }
};

module.exports = { getDoctorInfo };
