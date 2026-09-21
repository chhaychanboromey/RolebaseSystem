global.crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
if (require.main === module) {
  (async () => {
    await dbConnect();
  })();
}
module.exports = dbConnect;
