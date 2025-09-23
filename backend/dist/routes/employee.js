"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const session_1 = require("../middleware/session");
const router = (0, express_1.Router)();
// Employee routes - require business authentication
router.get("/", ...(0, session_1.requireBusiness)(), employeeController_1.employeeController.getAllEmployees);
router.get("/:id", ...(0, session_1.requireBusiness)("employee"), employeeController_1.employeeController.getEmployeeById);
router.post("/", ...(0, session_1.requireBusiness)(), employeeController_1.employeeController.createEmployee);
router.put("/:id", ...(0, session_1.requireBusiness)("employee"), employeeController_1.employeeController.updateEmployee);
router.delete("/:id", ...(0, session_1.requireBusiness)("employee"), employeeController_1.employeeController.deleteEmployee);
// Employee service assignment routes
router.post("/:id/services", ...(0, session_1.requireBusiness)("employee"), employeeController_1.employeeController.assignServiceToEmployee);
router.delete("/:id/services/:serviceId", ...(0, session_1.requireBusiness)("employee"), employeeController_1.employeeController.removeServiceFromEmployee);
exports.default = router;
