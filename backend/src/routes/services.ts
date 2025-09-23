import { Router } from "express";
import { serviceController } from "../controllers/serviceController";
import { requireAuth, requireRole, getBusinessId } from "../middleware/session";

const router = Router();

// Service routes
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

// Routes që kërkojnë autentifikim dhe businessId
router.post(
  "/",
  requireAuth,
  requireRole(["BUSINESS"]),
  getBusinessId,
  serviceController.createService
);
router.put(
  "/:id",
  requireAuth,
  requireRole(["BUSINESS"]),
  getBusinessId,
  serviceController.updateService
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["BUSINESS"]),
  getBusinessId,
  serviceController.deleteService
);

export default router;
