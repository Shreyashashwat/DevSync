import express from "express";
import { aiCategoryPriority } from "../controllers/aiController.js";

const router = express.Router();
router.post("/classify", aiCategoryPriority);

export default router;
