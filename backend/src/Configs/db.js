import { connect } from 'mongoose';
import { sendnoti } from '../firebase/SendNotification.js';

const connectDB = async () => {
  try {
    // MONGO_URI is pulled from the .env file
    const conn = await connect(process.env.MONGODB_URI);
     sendnoti();
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;