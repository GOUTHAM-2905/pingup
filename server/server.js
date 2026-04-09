import express from "express";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
 

const app = express();
app.use(cors());
app.use(express.json());
await connectDB();


app.get('/', (req, res) => {
  res.send("Server is running")
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});