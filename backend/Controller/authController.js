const { getDb } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Lấy thông tin người dùng từ token
const getAuthEndpoint = (request, response) => {
  response.json({
    userType: request.user.userType,
    userData: request.user.userData,
  });
};

// Đăng ký tài khoản
const register = async (req, res) => {
  let { userType, ...userData } = req.body;
  try {
    // Normalize Ethereum address (lowercase)
    if (userData.walletAddress) {
      userData.walletAddress = userData.walletAddress.toLowerCase();
    }

    const db = getDb();

    // Kiểm tra user đã tồn tại (case-insensitive cho email)
    const userExists = await db.collection(userType).findOne({
      $or: [
        { walletAddress: userData.walletAddress },
        { email: { $regex: new RegExp(`^${userData.email}$`, "i") } },
      ],
    });

    if (userExists) {
      return res.status(400).send({ error: "User already exists." });
    }

    userData.password = await bcrypt.hash(userData.password, 10);
    userData.createdAt = new Date();

    const result = await db.collection(userType).insertOne(userData);

    console.log(
      `[DEBUG] New ${userType} registered: ${userData.email} (${userData.walletAddress})`,
    );
    res.status(200).json({
      success: "User created successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error storing user data:", error);
    res.status(500).send({
      error: "An error occurred while trying to create a user.",
      details: error.message,
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  let { userType, email, password } = req.body;
  try {
    const db = getDb();

    // Tìm user by email (case-insensitive)
    const user = await db.collection(userType).findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return res.status(400).send({ error: "User not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).send({ error: "Incorrect password." });
    }

    const accessToken = jwt.sign(
      { userType: userType, userData: user },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    console.log(`[DEBUG] ${userType} logged in: ${user.email}`);

    res.status(200).json({
      success: "User logged in successfully.",
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({
      error: "An error occurred while trying to log in.",
      details: error.message,
    });
  }
};

module.exports = { getAuthEndpoint, register, login };
