// Request validation middleware

import { Request, Response, NextFunction } from "express";

// Helper function to get date normalized to midnight UTC
const getNormalizeMidnightUTC = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// Helper function to get today at midnight UTC
const getTodayMidnightUTC = (): Date => {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup validation
export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, role } = req.body;

  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (role && !['admin', 'customer'].includes(role)) {
    errors.push("Role must be either 'admin' or 'customer'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.join(", ")
    });
  }

  next();
};

// Vehicle validation
export const validateVehicle = (req: Request, res: Response, next: NextFunction) => {
  const { vehicle_name, type, registration_number, daily_rent_price } = req.body;

  const errors: string[] = [];

  if (!vehicle_name || vehicle_name.trim().length === 0) {
    errors.push("Vehicle name is required");
  }

  if (!type || !['car', 'bike', 'van', 'SUV'].includes(type)) {
    errors.push("Type must be one of: car, bike, van, SUV");
  }

  if (!registration_number || registration_number.trim().length === 0) {
    errors.push("Registration number is required");
  }

  if (!daily_rent_price || daily_rent_price <= 0) {
    errors.push("Daily rent price must be a positive number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.join(", ")
    });
  }

  next();
};

// Booking validation
export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const { vehicle_id, rent_start_date, rent_end_date } = req.body;

  const errors: string[] = [];

  if (!vehicle_id) {
    errors.push("Vehicle ID is required");
  }

  if (!rent_start_date) {
    errors.push("Start date is required");
  }

  if (!rent_end_date) {
    errors.push("End date is required");
  }

  if (rent_start_date && rent_end_date) {
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (isNaN(startDate.getTime())) {
      errors.push("Invalid start date format");
    }

    if (isNaN(endDate.getTime())) {
      errors.push("Invalid end date format");
    }

    // Check that start date is not in the past
    if (!isNaN(startDate.getTime())) {  // Only check if format is valid
      const startDateMidnight = getNormalizeMidnightUTC(rent_start_date);
      const todayMidnight = getTodayMidnightUTC();

      if (startDateMidnight < todayMidnight) {
        errors.push("Start date cannot be in the past. Please select today or a future date");
      }
    }

    if (endDate <= startDate) {
      errors.push("End date must be after start date");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.join(", ")
    });
  }

  next();
};
