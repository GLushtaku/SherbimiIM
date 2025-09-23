"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
// Category routes
router.post("/create", categoryController_1.categoryController.createCategroy);
router.get("/", categoryController_1.categoryController.getAllCategories);
router.get("/:name", categoryController_1.categoryController.getCategoryByName);
exports.default = router;
