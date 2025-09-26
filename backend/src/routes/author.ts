import { Router } from "express";
import { authorController } from "../controllers/authorController";

const router = Router();

// Booking routes - only accessible by CLIENT role users

router.get("/", authorController.getAllAuthors);
router.get("/:id", authorController.getAuthorById);
router.post("/", authorController.createAuthor);
router.put("/:id", authorController.updateAuthor);
router.delete(
  "/:id",
  authorController.deleteAuthor
);


export default router;
