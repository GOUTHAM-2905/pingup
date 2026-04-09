import express from "express";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./Inngest/index.js"; 

const app = express();
app.use(cors());
app.use(express.json());
await connectDB();


app.get('/', (req, res) => {
  res.send("Server is running")
});
app.use("/api/inngest", serve({client:inngest, functions}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});