import express from "express";
import {
    createReservation,
    getReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
} from "../controllers/reservation.controller.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getReservations).post(formSubmissionLimiter, createReservation);

router
    .route("/:id")
    .get(protect, getReservationById)
    .put(protect, updateReservation)
    .delete(protect, deleteReservation);

export default router;