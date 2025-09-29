"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const session_1 = require("../middleware/session");
const router = (0, express_1.Router)();
// Service routes
router.get("/", serviceController_1.serviceController.getAllServices);
router.get("/business", ...(0, session_1.requireBusiness)(), serviceController_1.serviceController.getBusinessServices);
router.get("/:id", serviceController_1.serviceController.getServiceById);
// Routes që kërkojnë autentifikim dhe businessId
router.post("/", ...(0, session_1.requireBusiness)(), serviceController_1.serviceController.createService);
router.put("/:id", ...(0, session_1.requireBusiness)("service"), serviceController_1.serviceController.updateService);
router.delete("/:id", ...(0, session_1.requireBusiness)("service"), serviceController_1.serviceController.deleteService);
exports.default = router;
