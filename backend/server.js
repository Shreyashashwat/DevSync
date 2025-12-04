import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import connectDB from './src/Configs/db.js';
connectDB(); 



const app = express();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// Allows parsing of JSON request bodies
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174"]
})); 



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));