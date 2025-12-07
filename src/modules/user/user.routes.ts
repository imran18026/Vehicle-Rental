import express from "express";
import { userControllers } from "./user.controller";
import auth from "../../middleware/auth";

const router = express.Router();

// GET /api/v1/users - Admin only
router.get("/", auth("admin"), userControllers.getUser);

// PUT /api/v1/users/:id - Admin or own profile
router.put("/:id", auth("admin", "customer"), userControllers.updateUser);

// DELETE /api/v1/users/:id - Admin only
router.delete("/:id", auth("admin"), userControllers.deleteUser);

export const userRoutes = router;
