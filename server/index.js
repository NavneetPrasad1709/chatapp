const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages");
const { socketHandler } = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// ==============================
// ENV CONFIG
// ==============================
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Important for Render / proxy environments
app.set("trust proxy", 1);

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json());

// ==============================
// SOCKET.IO
// ==============================

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"], // important for Render
});

socketHandler(io);

// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// Health route (for Render check)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// ==============================
// DATABASE + SERVER START
// ==============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ==============================
// HANDLE ERRORS PROPERLY
// ==============================

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});