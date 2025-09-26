"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorController_1 = require("../controllers/authorController");
const router = (0, express_1.Router)();
// Booking routes - only accessible by CLIENT role users
router.get("/", authorController_1.authorController.getAllAuthors);
router.get("/:id", authorController_1.authorController.getAuthorById);
router.post("/", authorController_1.authorController.createAuthor);
router.put("/:id", authorController_1.authorController.updateAuthor);
router.delete("/:id", authorController_1.authorController.deleteAuthor);
exports.default = router;
