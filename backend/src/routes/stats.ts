import { Router } from "express";
import { statsController } from "../controllers/statsController";
import { requireBusiness } from "../middleware/session";

const router = Router();

// GET /api/stats - Get platform statistics (public)
router.get("/", statsController.getStats);

// GET /api/stats/dashboard - Get dashboard statistics (requires business authentication)
router.get(
  "/dashboard",
  ...requireBusiness(),
  statsController.getDashboardStats
);

export default router;
