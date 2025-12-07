import { pool } from "../../config/db";

interface BookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const createBooking = async (payload: BookingPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // Start transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check vehicle availability
    const vehicleResult = await client.query(
      `SELECT * FROM vehicles WHERE id = $1 FOR UPDATE`,
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      throw new Error("Vehicle not found");
    }

    const vehicle = vehicleResult.rows[0];

    // Check vehicle availability
    if (vehicle.availability_status !== 'available') {
      throw new Error("Vehicle is not available for booking");
    }

    // Calculate total price
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      throw new Error("End date must be after start date");
    }

    const total_price = vehicle.daily_rent_price * daysDiff;

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    // Update vehicle status to booked
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [vehicle_id]
    );

    await client.query('COMMIT');

    // Fetch booking with vehicle details
    const booking = bookingResult.rows[0];
    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
      }
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getBookings = async (userId?: number, userRole?: string) => {
  let query = `
    SELECT b.*,
           u.name as customer_name, u.email as customer_email,
           v.vehicle_name, v.type as vehicle_type, v.registration_number
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  const values: any[] = [];

  // If customer, only show their bookings
  if (userRole === 'customer' && userId) {
    query += ` WHERE b.customer_id = $1`;
    values.push(userId);
  }

  query += ` ORDER BY b.id DESC`;

  const result = await pool.query(query, values);
  return result;
};

const updateBooking = async (id: string, status: 'active' | 'cancelled' | 'returned') => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get booking
    const bookingResult = await client.query(
      `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // Update booking status
    const updateResult = await client.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    // If cancelled or returned, update vehicle status to available
    if (status === 'cancelled' || status === 'returned') {
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    await client.query('COMMIT');

    // Fetch vehicle availability status
    const vehicleResult = await pool.query(
      `SELECT availability_status FROM vehicles WHERE id = $1`,
      [booking.vehicle_id]
    );

    return {
      ...updateResult.rows[0],
      vehicle: {
        availability_status: vehicleResult.rows[0].availability_status
      }
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getBookings,
  updateBooking,
};
