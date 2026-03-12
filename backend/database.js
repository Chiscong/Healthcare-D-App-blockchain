require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_CONNECTION_KEY);
let db = null;

module.exports = {
  connectDb: async () => {
    try {
      await client.connect();
      db = client.db("medical-healthcare");
      console.log("Connected to MongoDB Atlas");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  },
  getDb: () => {
    if (!db) {
      throw new Error("Database not connected");
    }
    return db;
  },
  closeDb: async () => {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  },
};
