import express from "express";
import { login } from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/login", loginLimiter, login);

export default router;