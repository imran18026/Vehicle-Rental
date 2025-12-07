import express from "express";
import { bookingControllers } from "./booking.controller";
import auth from "../../middleware/auth";
import { validateBooking } from "../../middleware/validation";

const router = express.Router();

// POST /api/v1/bookings - Customer or Admin
router.post("/", auth("admin", "customer"), validateBooking, bookingControllers.createBooking);

// GET /api/v1/bookings - Customer (own) or Admin (all)
router.get("/", auth("admin", "customer"), bookingControllers.getBookings);

// PUT /api/v1/bookings/:id - Customer (own) or Admin (all)
router.put("/:id", auth("admin", "customer"), bookingControllers.updateBooking);

export const bookingRoutes = router;
