import { Router } from "express";
import { authController } from "./auth.controller";
import { validateSignup } from "../../middleware/validation";

const router = Router();

// POST /api/v1/auth/signup
router.post("/signup", validateSignup, authController.signupUser);

// POST /api/v1/auth/signin
router.post("/signin", authController.loginUser);

export const authRoutes = router;
