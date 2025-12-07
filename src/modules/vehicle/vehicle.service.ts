import { pool } from "../../config/db";

interface VehiclePayload {
  vehicle_name: string;
  type: 'car' | 'bike' | 'van' | 'SUV';
  registration_number: string;
  daily_rent_price: number;
  availability_status?: 'available' | 'booked';
}

const createVehicle = async (payload: VehiclePayload) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
  );

  return result;
};

const getVehicles = async () => {
  const result = await pool.query(`SELECT * FROM vehicles ORDER BY id DESC`);
  return result;
};

const getSingleVehicle = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  return result;
};

const updateVehicle = async (payload: Partial<VehiclePayload>, id: string) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

  // Build dynamic query
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (vehicle_name !== undefined) {
    updates.push(`vehicle_name = $${paramIndex++}`);
    values.push(vehicle_name);
  }
  if (type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(type);
  }
  if (registration_number !== undefined) {
    updates.push(`registration_number = $${paramIndex++}`);
    values.push(registration_number);
  }
  if (daily_rent_price !== undefined) {
    updates.push(`daily_rent_price = $${paramIndex++}`);
    values.push(daily_rent_price);
  }
  if (availability_status !== undefined) {
    updates.push(`availability_status = $${paramIndex++}`);
    values.push(availability_status);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);

  return result;
};

const deleteVehicle = async (id: string) => {
  // Check for active bookings
  const bookingCheck = await pool.query(
    `SELECT COUNT(*) FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
    [id]
  );

  if (parseInt(bookingCheck.rows[0].count) > 0) {
    throw new Error("Cannot delete vehicle with active bookings");
  }

  const result = await pool.query(`DELETE FROM vehicles WHERE id = $1 RETURNING id`, [id]);
  return result;
};

export const vehicleServices = {
  createVehicle,
  getVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
