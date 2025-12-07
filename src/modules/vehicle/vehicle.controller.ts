import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0]
    });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists",
        errors: "A vehicle with this registration number is already registered"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      errors: err.message
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicles();

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicles",
      errors: err.message
    });
  }
};

const getSingleVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getSingleVehicle(req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicle",
      errors: err.message
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.updateVehicle(req.body, req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0]
    });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists"
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
      message: "Failed to update vehicle",
      errors: err.message
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.deleteVehicle(req.params.id!);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });
  } catch (err: any) {
    if (err.message.includes("active bookings")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle",
        errors: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      errors: err.message
    });
  }
};

export const vehicleControllers = {
  createVehicle,
  getVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
