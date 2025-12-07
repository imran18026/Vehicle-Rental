import { Request, Response } from "express";
import { userServices } from "./user.service";

const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUser();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      errors: err.message
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getSingleUser(req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      errors: err.message
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id!);
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    // Check if customer is updating their own profile
    if (currentUserRole === 'customer' && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }

    // Only admins can update roles
    if (req.body.role && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can update user roles"
      });
    }

    const result = await userServices.updateUser(req.body, req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: "A user with this email is already registered"
      });
    }

    if (err.message.includes("No fields to update")) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
        errors: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      errors: err.message
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUser(req.params.id!);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err: any) {
    if (err.message.includes("active bookings")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user",
        errors: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      errors: err.message
    });
  }
};

export const userControllers = {
  getUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
