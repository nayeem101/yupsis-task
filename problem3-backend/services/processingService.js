const Message = require("../models/message");

// retryDelays in minutes
const RETRY_DELAYS = {
  1: 2,
  2: 5,
  3: 10,
  4: 20,
  5: 30,
  default: 60,
};

function validateTransaction(trxId) {
  const randomNumber = Math.floor(Math.random() * 1000);
  console.log(`Validating transaction: ${trxId}, Random number: ${randomNumber}`);

  return parseInt(trxId) === randomNumber;
}

function netfeeCustomerRecharge(message) {
  console.log(`Processing customer recharge for message: ${message._id}`);
  return true;
}

async function findNextMessageToProcess() {
  const now = new Date();

  // find pending messages
  const message = await Message.findOne({
    status: "pending",
  }).sort({ createdAt: 1 });

  // no pending messages, find rejected messages
  if (!message) {
    return await Message.findOne({
      status: "rejected",
      nextAttemptAt: { $lte: now },
    }).sort({ createdAt: 1, nextAttemptAt: 1 });
  }

  return message;
}

function calculateNextAttemptTime(attemptCount) {
  const retryMinutes = RETRY_DELAYS[attemptCount] || RETRY_DELAYS.default;
  const now = new Date();
  return new Date(now.getTime() + retryMinutes * 60 * 1000);
}

async function processNextMessage() {
  try {
    const message = await findNextMessageToProcess();

    if (!message) {
      console.log("No messages to process");
      return { status: "idle", message: "No messages to process" };
    }

    message.status = "processing";
    message.lastProcessedAt = new Date();
    await message.save();

    console.log(`Processing message: ${message._id}, Transaction ID: ${message.trxId}`);

    const isValid = validateTransaction(message.trxId);

    if (isValid) {
      message.status = "success";
      await message.save();

      // process customer recharge on success
      netfeeCustomerRecharge(message);

      console.log(`Message ${message._id} processed successfully`);
      return { status: "success", message };
    } else {
      // rejected and retry
      message.status = "rejected";
      message.attemptCount += 1;
      message.nextAttemptAt = calculateNextAttemptTime(message.attemptCount);
      await message.save();

      console.log(`Message ${message._id} rejected. Next attempt at: ${message.nextAttemptAt}`);
      return { status: "rejected", message };
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return { status: "error", error: error.message };
  }
}

function generateRandomTransactionId() {
  return Math.floor(Math.random() * 1000).toString();
}

// initial seed messages for testing
async function seedInitialMessages() {
  try {
    const count = await Message.countDocuments();

    if (count === 0) {
      console.log("Seeding initial messages...");

      const initialMessages = [];

      for (let i = 0; i < 10; i++) {
        initialMessages.push({
          trxId: generateRandomTransactionId(),
          content: `Initial message ${i + 1}`,
          status: "pending",
          attemptCount: 0,
          nextAttemptAt: new Date(),
          createdAt: new Date(Date.now() - (10 - i) * 60000),
        });
      }

      initialMessages.push({
        trxId: generateRandomTransactionId(),
        content: "Rejected message 1",
        status: "rejected",
        attemptCount: 1,
        nextAttemptAt: new Date(Date.now() - 30000),
        createdAt: new Date(Date.now() - 30 * 60000),
      });

      initialMessages.push({
        trxId: generateRandomTransactionId(),
        content: "Rejected message 2",
        status: "rejected",
        attemptCount: 3,
        nextAttemptAt: new Date(Date.now() + 5 * 60000),
        createdAt: new Date(Date.now() - 60 * 60000),
      });

      // successful message
      initialMessages.push({
        trxId: generateRandomTransactionId(),
        content: "Successful message",
        status: "success",
        attemptCount: 2,
        nextAttemptAt: null,
        createdAt: new Date(Date.now() - 120 * 60000),
      });

      await Message.insertMany(initialMessages);

      console.log(`Seeded ${initialMessages.length} initial messages`);
    } else {
      console.log(`Database already contains ${count} messages. Skipping seed.`);
    }
  } catch (error) {
    console.error("Error seeding initial messages:", error);
  }
}

async function startProcessingJob(interval = 10000) {
  console.log(`Starting message processing job, checking every ${interval / 1000} seconds`);

  await seedInitialMessages(); // for testing

  processNextMessage();

  setInterval(async () => {
    await processNextMessage();
  }, interval);
}

function startMessageGenerator(interval = 20000) {
  console.log(`Starting message generator, creating a new message every ${interval / 1000} seconds`);

  setInterval(async () => {
    try {
      const newMessage = new Message({
        trxId: generateRandomTransactionId(),
        content: `Auto-generated message at ${new Date().toLocaleTimeString()}`,
        status: "pending",
        attemptCount: 0,
        nextAttemptAt: new Date(),
      });

      await newMessage.save();
      console.log(`Generated new message with ID: ${newMessage._id}`);
    } catch (error) {
      console.error("Error generating new message:", error);
    }
  }, interval);
}

module.exports = {
  processNextMessage,
  startProcessingJob,
  startMessageGenerator,
};
