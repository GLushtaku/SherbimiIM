"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const session_1 = require("../middleware/session");
const router = (0, express_1.Router)();
// Booking routes - only accessible by CLIENT role users
router.get("/", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.getAllBookings);
router.get("/:id", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.getBookingById);
router.post("/", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.createBooking);
router.put("/:id", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.updateBooking);
router.delete("/:id", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.deleteBooking);
router.post("/availability", ...(0, session_1.requireClientAccess)(), bookingController_1.bookingController.checkAvailability);
exports.default = router;
