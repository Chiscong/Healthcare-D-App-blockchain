const express = require("express");
const { connectDb, getDb } = require("./database");
const { initializeCollections } = require("./configs/database-init");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Import routes
const authRoutes = require("./Routes/authRoutes");
const appointmentRoutes = require("./Routes/appointmentRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const debugRoutes = require("./Routes/debugRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Routes
app.use("/", authRoutes);
app.use("/", appointmentRoutes);
app.use("/", doctorRoutes);
app.use("/", debugRoutes); // Debug endpoints

// Connect to database and start server
let server;
connectDb()
  .then(async () => {
    console.log("✓ Database connected");

    // Initialize collections and indexes
    await initializeCollections();

    server = app.listen(PORT, () => {
      console.log(`✓ Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("✗ Failed to connect to database:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  if (server) server.close();
  const { closeDb } = require("./database");
  await closeDb();
  process.exit(0);
});

module.exports = app;
