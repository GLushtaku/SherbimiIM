import { Router } from "express";
import { bookController } from "../controllers/bookController";

const router = Router();

router.get("/", bookController.getAllBooks);
router.post("/", bookController.createBook);
router.get("/:id", bookController.getBookkById);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);
export default router;
