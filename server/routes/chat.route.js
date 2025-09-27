import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:userId", authenticate, getChatHistory);

export default router;
