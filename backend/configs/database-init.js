/**
 * Database Initialization
 * Tạo các collections và indexes trong MongoDB khi server khởi động
 */

const { getDb } = require("../database");

const initializeCollections = async () => {
  try {
    const db = getDb();

    // Danh sách collections cần tạo
    const collections = {
      doctor: {
        // Tạo unique index cho email và walletAddress
        indexes: [
          { key: { email: 1 }, unique: true, sparse: true },
          { key: { walletAddress: 1 }, unique: true, sparse: true },
          { key: { createdAt: 1 } },
        ],
      },
      patient: {
        indexes: [
          { key: { email: 1 }, unique: true, sparse: true },
          { key: { walletAddress: 1 }, unique: true, sparse: true },
          { key: { createdAt: 1 } },
        ],
      },
      appointments: {
        indexes: [
          { key: { doctorAddress: 1 } },
          { key: { patientAddress: 1 } },
          { key: { status: 1 } },
          { key: { createdAt: 1, _id: -1 } }, // Sắp xếp theo ngày tạo mới nhất trước
          { key: { date: 1, time: 1 } }, // Index cho tìm kiếm theo ngày/giờ
        ],
      },
    };

    // Tạo từng collection
    for (const [collectionName, config] of Object.entries(collections)) {
      try {
        // Kiểm tra collection có tồn tại không
        const collections_list = await db
          .listCollections({ name: collectionName })
          .toArray();

        if (collections_list.length === 0) {
          // Tạo collection nếu chưa tồn tại
          await db.createCollection(collectionName);
          console.log(`✓ Collection '${collectionName}' created`);
        } else {
          console.log(`✓ Collection '${collectionName}' already exists`);
        }

        // Tạo indexes
        if (config.indexes) {
          for (const indexSpec of config.indexes) {
            await db.collection(collectionName).createIndex(indexSpec.key, {
              unique: indexSpec.unique || false,
              sparse: indexSpec.sparse || false,
              background: true,
            });
          }
          console.log(`✓ Indexes created for '${collectionName}'`);
        }
      } catch (error) {
        console.error(
          `Error initializing collection '${collectionName}':`,
          error.message,
        );
      }
    }

    console.log("✓ Database initialization completed successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  }
};

module.exports = { initializeCollections };
