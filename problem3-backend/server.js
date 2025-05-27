// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const messageRoutes = require("./controllers/messageController");
const processingService = require("./services/processingService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/message-processor")
  .then(() => {
    console.log("Connected to MongoDB");
    startServices();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// routes
app.use("/api/messages", messageRoutes);

function startServices() {
  processingService.startProcessingJob();

  processingService.startMessageGenerator();

  console.log("All services started successfully");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
