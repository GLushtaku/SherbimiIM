"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const session_1 = require("../middleware/session");
const router = (0, express_1.Router)();
// Authentication routes
router.post("/register", authController_1.authController.register);
router.post("/login", authController_1.authController.login);
router.post("/logout", authController_1.authController.logout);
router.get("/me", authController_1.authController.getCurrentUser);
// Profile routes (require authentication)
router.put("/profile", session_1.requireAuth, authController_1.authController.updateProfile);
router.put("/password", session_1.requireAuth, authController_1.authController.updatePassword);
exports.default = router;
