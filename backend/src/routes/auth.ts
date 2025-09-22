import { Router } from "express";
import { authController } from "../controllers/authController";

const router = Router();

// Authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);

export default router;
