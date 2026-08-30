import express from "express";
import { register, login, getMe, updateMe } from "../controllers/customer.controller.js";
import { getMyFavorites } from "../controllers/favorite.controller.js";
import protectCustomer from "../middleware/protectCustomer.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/customer.validators.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", formSubmissionLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);

router.get("/me", protectCustomer, getMe);
router.put("/me", protectCustomer, validate(updateProfileSchema), updateMe);
router.get("/me/favorites", protectCustomer, getMyFavorites);

export default router;