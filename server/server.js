import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cookie from "cookie";

import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.route.js";
import Message from "./models/message.model.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins (production + localhost)
const allowedOrigins = [
  "https://www.advestors.org",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://advestor-frontend-org.vercel.app",
  "https://advestor-frontend-org-git-main-abhisheks-projects-680a2fd9.vercel.app",
  "https://advestor-frontend-org-abhisheks-projects-680a2fd9.vercel.app"
  
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Chat API
app.use("/api/chat", chatRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

// Socket authentication using JWT from cookies
io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error("No cookies found"));

    const parsed = cookie.parse(cookies);
    const token = parsed.accessToken;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    next(new Error("Authentication error: " + err.message));
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  const userId = socket.user.sub;
  onlineUsers.set(userId, socket.id);
  console.log(`✅ User connected: ${userId}`);

  // Private messaging
  socket.on("private_message", async ({ to, message }) => {
    try {
      await Message.create({ from: userId, to, message });

      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("private_message", { from: userId, message });
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`❌ User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

