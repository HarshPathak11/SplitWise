import mongoose from 'mongoose';

const mongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`✅ Connected to MongoDB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default mongoDB;
