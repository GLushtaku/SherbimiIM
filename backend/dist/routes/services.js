"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const session_1 = require("../middleware/session");
const router = (0, express_1.Router)();
// Service routes
router.get("/", serviceController_1.serviceController.getAllServices);
router.get("/:id", serviceController_1.serviceController.getServiceById);
// Routes që kërkojnë autentifikim dhe businessId
router.post("/", session_1.requireAuth, (0, session_1.requireRole)(["BUSINESS"]), session_1.getBusinessId, serviceController_1.serviceController.createService);
router.put("/:id", session_1.requireAuth, (0, session_1.requireRole)(["BUSINESS"]), session_1.getBusinessId, serviceController_1.serviceController.updateService);
router.delete("/:id", session_1.requireAuth, (0, session_1.requireRole)(["BUSINESS"]), session_1.getBusinessId, serviceController_1.serviceController.deleteService);
exports.default = router;
