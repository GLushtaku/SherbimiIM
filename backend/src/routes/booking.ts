import { Router } from "express";
import { bookingController } from "../controllers/bookingController";
import { requireClientAccess } from "../middleware/session";

const router = Router();

// Booking routes - only accessible by CLIENT role users
router.get("/", ...requireClientAccess(), bookingController.getAllBookings);
router.get("/:id", ...requireClientAccess(), bookingController.getBookingById);
router.post("/", ...requireClientAccess(), bookingController.createBooking);
router.put("/:id", ...requireClientAccess(), bookingController.updateBooking);
router.delete(
  "/:id",
  ...requireClientAccess(),
  bookingController.deleteBooking
);
router.post(
  "/availability",
  ...requireClientAccess(),
  bookingController.checkAvailability
);

export default router;
