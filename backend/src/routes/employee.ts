import { Router } from "express";
import { employeeController } from "../controllers/employeeController";
import { requireBusiness } from "../middleware/session";

const router = Router();

// Employee routes - require business authentication
router.get("/", ...requireBusiness(), employeeController.getAllEmployees);
router.get(
  "/:id",
  ...requireBusiness("employee"),
  employeeController.getEmployeeById
);
router.post("/", ...requireBusiness(), employeeController.createEmployee);
router.put(
  "/:id",
  ...requireBusiness("employee"),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  ...requireBusiness("employee"),
  employeeController.deleteEmployee
);

// Employee service assignment routes
router.post(
  "/:id/services",
  ...requireBusiness("employee"),
  employeeController.assignServiceToEmployee
);
router.delete(
  "/:id/services/:serviceId",
  ...requireBusiness("employee"),
  employeeController.removeServiceFromEmployee
);

export default router;
