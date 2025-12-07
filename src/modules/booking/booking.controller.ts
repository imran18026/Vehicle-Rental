import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { pool } from "../../config/db";

const createBooking = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const authenticatedUserId = req.user?.id;

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Determine customer_id based on role
    let customer_id: number;
    if (userRole === 'admin' && req.body.customer_id) {
      // Admin can specify customer_id in request body
      customer_id = req.body.customer_id;
    } else {
      // Customers use their own ID
      customer_id = authenticatedUserId;
    }

    const bookingData = {
      customer_id,
      vehicle_id: req.body.vehicle_id,
      rent_start_date: req.body.rent_start_date,
      rent_end_date: req.body.rent_end_date
    };

    const result = await bookingServices.createBooking(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result
    });
  } catch (err: any) {
    // 404 - Vehicle not found
    if (err.message.includes("Vehicle not found")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }

    // 400 - Vehicle not available
    if (err.message.includes("not available")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // 400 - Bad request (validation errors)
    if (err.message.includes("End date must be after start date")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // 500 - Internal server error
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      errors: err.message
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await bookingServices.getBookings(userId, userRole);

    const message = userRole === 'customer'
      ? "Your bookings retrieved successfully"
      : "Bookings retrieved successfully";

    // Format response based on user role
    const formattedData = result.rows.map((booking: any) => {
      if (userRole === 'admin') {
        // Admin view: include customer and vehicle details
        return {
          id: booking.id,
          customer_id: booking.customer_id,
          vehicle_id: booking.vehicle_id,
          rent_start_date: booking.rent_start_date,
          rent_end_date: booking.rent_end_date,
          total_price: parseFloat(booking.total_price),
          status: booking.status,
          customer: {
            name: booking.customer_name,
            email: booking.customer_email
          },
          vehicle: {
            vehicle_name: booking.vehicle_name,
            registration_number: booking.registration_number
          }
        };
      } else {
        // Customer view: exclude customer_id, include vehicle details
        return {
          id: booking.id,
          vehicle_id: booking.vehicle_id,
          rent_start_date: booking.rent_start_date,
          rent_end_date: booking.rent_end_date,
          total_price: parseFloat(booking.total_price),
          status: booking.status,
          vehicle: {
            vehicle_name: booking.vehicle_name,
            registration_number: booking.registration_number,
            type: booking.vehicle_type
          }
        };
      }
    });

    res.status(200).json({
      success: true,
      message: message,
      data: formattedData
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      errors: err.message
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id!;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!status || !['active', 'cancelled', 'returned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active', 'cancelled', or 'returned'"
      });
    }

    // Check if customer is updating their own booking
    if (userRole === 'customer') {
      const bookingCheck = await pool.query(
        `SELECT * FROM bookings WHERE id = $1 AND customer_id = $2`,
        [bookingId, userId]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own bookings"
        });
      }

      // Customers can only cancel bookings
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: "Customers can only cancel bookings"
        });
      }

      // Check if booking can be cancelled (only before start date)
      const booking = bookingCheck.rows[0];
      const startDate = new Date(booking.rent_start_date);
      const today = new Date();

      // Normalize to midnight for comparison
      const startDateMidnight = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
      const todayMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

      if (todayMidnight >= startDateMidnight) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel booking on or after the start date"
        });
      }
    }

    const result = await bookingServices.updateBooking(bookingId, status);

    const message = status === 'cancelled'
      ? "Booking cancelled successfully"
      : "Booking marked as returned. Vehicle is now available";

    res.status(200).json({
      success: true,
      message: message,
      data: result
    });
  } catch (err: any) {
    if (err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      errors: err.message
    });
  }
};

export const bookingControllers = {
  createBooking,
  getBookings,
  updateBooking,
};
