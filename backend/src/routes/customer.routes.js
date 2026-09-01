import express from "express";
import {
    register,
    login,
    getMe,
    updateMe,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
} from "../controllers/customer.controller.js";
import { getMyFavorites } from "../controllers/favorite.controller.js";
import protectCustomer from "../middleware/protectCustomer.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../validators/customer.validators.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", formSubmissionLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protectCustomer, formSubmissionLimiter, resendVerification);
router.post("/forgot-password", loginLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", loginLimiter, validate(resetPasswordSchema), resetPassword);

router.get("/me", protectCustomer, getMe);
router.put("/me", protectCustomer, validate(updateProfileSchema), updateMe);
router.get("/me/favorites", protectCustomer, getMyFavorites);

export default router;
