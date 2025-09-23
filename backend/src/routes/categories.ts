import { Router } from "express";
import { categoryController } from "../controllers/categoryController";

const router = Router();

// Category routes
router.post("/create", categoryController.createCategroy);
router.get("/", categoryController.getAllCategories);
router.get("/:name", categoryController.getCategoryByName);

export default router;
