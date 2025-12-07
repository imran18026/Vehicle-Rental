import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signupUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (err: any) {
    // Handle duplicate email error
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: "A user with this email is already registered"
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      errors: err.message
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authServices.loginUser(email, password);

    if (result === null) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (result === false) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      errors: err.message
    });
  }
};

export const authController = {
  signupUser,
  loginUser,
};
