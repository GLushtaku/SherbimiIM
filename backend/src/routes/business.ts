import { Router } from "express";
import { businessController } from "../controllers/businessController";

const router = Router();

// Business routes
router.get("/", businessController.getAllBusinesses);
router.get("/:id", businessController.getBusinessById);
router.post("/", businessController.createBusiness);
// router.put("/:id", businessController.updateBusiness);
// router.delete("/:id", businessController.deleteBusiness);

// Business profile routes - require business authentication
// router.get("/profile", businessController.getBusinessProfile);
// router.put(
//   "/profile",
//   businessController.updateBusinessProfile
// );

export default router;
