// models/message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  trxId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "success", "rejected"],
    default: "pending",
  },
  attemptCount: {
    type: Number,
    default: 0,
  },
  nextAttemptAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastProcessedAt: Date,
});

// Create index for efficient querying of messages to process
messageSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
