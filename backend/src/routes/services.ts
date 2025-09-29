import { Router } from "express";
import { serviceController } from "../controllers/serviceController";
import { requireBusiness } from "../middleware/session";

const router = Router();

// Service routes
router.get("/", serviceController.getAllServices);
router.get(
  "/business",
  ...requireBusiness(),
  serviceController.getBusinessServices
);
router.get("/:id", serviceController.getServiceById);

// Routes që kërkojnë autentifikim dhe businessId
router.post("/", ...requireBusiness(), serviceController.createService);
router.put(
  "/:id",
  ...requireBusiness("service"),
  serviceController.updateService
);
router.delete(
  "/:id",
  ...requireBusiness("service"),
  serviceController.deleteService
);

export default router;
