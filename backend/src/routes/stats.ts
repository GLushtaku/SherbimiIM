import { Router } from "express";
import { statsController } from "../controllers/statsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/stats - Get platform statistics (public)
router.get("/", statsController.getStats);

// GET /api/stats/dashboard - Get dashboard statistics (requires business authentication)
router.get("/dashboard", authMiddleware, statsController.getDashboardStats);

export default router;
