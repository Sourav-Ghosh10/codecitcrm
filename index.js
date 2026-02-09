const functions = require("firebase-functions");
const app = require("./server");
const { connectDB } = require("./server");

// Connect to MongoDB
connectDB();

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
