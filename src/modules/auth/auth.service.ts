import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

const signupUser = async (payload: SignupPayload) => {
  const { name, email, password, phone, role } = payload;

  // Convert email to lowercase
  const lowercaseEmail = email.toLowerCase();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user with default role 'customer' if not provided
  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role)
     VALUES($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role`,
    [name, lowercaseEmail, hashedPassword, phone || null, role || 'customer']
  );

  const user = result.rows[0];

  return user;
};

const loginUser = async (email: string, password: string) => {
  // Convert email to lowercase for case-insensitive lookup
  const lowercaseEmail = email.toLowerCase();

  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    lowercaseEmail,
  ]);

  if (result.rows.length === 0) {
    return null; // User not found
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return false; // Invalid password
  }

  // Generate token with user ID
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    { expiresIn: "7d" }
  );

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

export const authServices = {
  signupUser,
  loginUser,
};
