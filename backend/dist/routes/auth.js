"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Authentication routes
router.post("/register", authController_1.authController.register);
router.post("/login", authController_1.authController.login);
router.post("/logout", authController_1.authController.logout);
router.get("/me", authController_1.authController.getCurrentUser);
exports.default = router;
