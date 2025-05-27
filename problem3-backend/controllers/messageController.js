const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const processingService = require("../services/processingService");

// get /api/messages?status=<pending|| processing|| success|| rejected>
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const messages = await Message.find(query).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get /api/messages/:id
router.get("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// post /api/messages
router.post("/", async (req, res) => {
  try {
    const { trxId, content } = req.body;

    if (!trxId || !content) {
      return res.status(400).json({ error: "trxId and content are required" });
    }

    const message = new Message({
      trxId,
      content,
    });

    await message.save();

    processingService.processNextMessage();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// post /api/messages/process -- manually trigger processing
router.post("/process", async (req, res) => {
  try {
    const result = await processingService.processNextMessage();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
