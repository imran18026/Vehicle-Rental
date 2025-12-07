import express from "express";
import { vehicleControllers } from "./vehicle.controller";
import auth from "../../middleware/auth";
import { validateVehicle } from "../../middleware/validation";

const router = express.Router();

// POST /api/v1/vehicles - Admin only
router.post("/", auth("admin"), validateVehicle, vehicleControllers.createVehicle);

// GET /api/v1/vehicles - Public
router.get("/", vehicleControllers.getVehicles);

// GET /api/v1/vehicles/:id - Public
router.get("/:id", vehicleControllers.getSingleVehicle);

// PUT /api/v1/vehicles/:id - Admin only
router.put("/:id", auth("admin"), vehicleControllers.updateVehicle);

// DELETE /api/v1/vehicles/:id - Admin only
router.delete("/:id", auth("admin"), vehicleControllers.deleteVehicle);

export const vehicleRoutes = router;
