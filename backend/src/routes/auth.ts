import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireAuth } from "../middleware/session";

const router = Router();

// Authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);
router.post("/oauth-login", authController.oauthLogin);

// Profile routes (require authentication)
router.put("/profile", requireAuth, authController.updateProfile);
router.put("/password", requireAuth, authController.updatePassword);

export default router;
