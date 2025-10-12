import mongoose from 'mongoose';
import {initExpenseCategorizer} from '../service/expenseCategorizer.js';

const mongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`✅ Connected to MongoDB: ${conn.connection.name}`);

    // Initialize expense categorizer
    initExpenseCategorizer();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default mongoDB;
