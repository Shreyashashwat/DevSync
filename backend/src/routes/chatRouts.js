import express from "express";

import { askChatbot } from "../controllers/chatController.js";
import { authorizeRoles, protect } from "../middlewares/auth.js";

const router = express.Router();








router.post("/ask",askChatbot)
export default router;