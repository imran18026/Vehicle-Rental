import { pool } from "../../config/db";

const getUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, created_at, updated_at FROM users`
  );
  return result;
};

const getSingleUser = async (id: string) => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  );
  return result;
};

const updateUser = async (
  payload: { name?: string; email?: string; phone?: string; role?: string },
  id: string
) => {
  const { name, email, phone, role } = payload;

  // Build dynamic query based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }

  if (email !== undefined) {
    const lowercaseEmail = email.toLowerCase();
    updates.push(`email = $${paramIndex++}`);
    values.push(lowercaseEmail);
  }

  if (phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(phone);
  }

  if (role !== undefined) {
    updates.push(`role = $${paramIndex++}`);
    values.push(role);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
                 RETURNING id, name, email, phone, role, updated_at`;

  const result = await pool.query(query, values);
  return result;
};

const deleteUser = async (id: string) => {
  // Check for active bookings
  const bookingCheck = await pool.query(
    `SELECT COUNT(*) FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );

  if (parseInt(bookingCheck.rows[0].count) > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [id]
  );

  return result;
};

export const userServices = {
  getUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
