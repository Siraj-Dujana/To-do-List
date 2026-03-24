const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const todoRoutes = require("../routes/todos");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "TaskFlow API is running ✅" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });