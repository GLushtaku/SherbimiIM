"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const businessController_1 = require("../controllers/businessController");
const router = (0, express_1.Router)();
// Business routes
router.get("/", businessController_1.businessController.getAllBusinesses);
router.get("/:id", businessController_1.businessController.getBusinessById);
router.post("/", businessController_1.businessController.createBusiness);
// router.put("/:id", businessController.updateBusiness);
// router.delete("/:id", businessController.deleteBusiness);
// Business profile routes - require business authentication
// router.get("/profile", businessController.getBusinessProfile);
// router.put(
//   "/profile",
//   businessController.updateBusinessProfile
// );
exports.default = router;
