"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/stats - Get platform statistics (public)
router.get("/", statsController_1.statsController.getStats);
// GET /api/stats/dashboard - Get dashboard statistics (requires business authentication)
router.get("/dashboard", auth_1.authMiddleware, statsController_1.statsController.getDashboardStats);
exports.default = router;
