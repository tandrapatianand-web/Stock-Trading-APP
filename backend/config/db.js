const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sbstocks';
  
  try {
    console.log(`Connecting to primary MongoDB: ${uri}`);
    // Connection timeout check
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}`);
    console.log('Attempting to spin up in-memory MongoDB fallback...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      global.useMockDb = false;

      process.on('SIGINT', async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        process.exit(0);
      });
    } catch (fallbackError) {
      console.warn(`Fallback In-Memory MongoDB failed: ${fallbackError.message}`);
      console.log('------------------------------------------------');
      console.log('⚡ Fallback: Activating local JSON Database engine!');
      console.log('📁 Data path: backend/data/db.json');
      console.log('------------------------------------------------');
      global.useMockDb = true;
    }
  }
};

module.exports = connectDB;
