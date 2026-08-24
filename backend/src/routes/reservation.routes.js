import express from "express";
import {
    createReservation,
    getReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
} from "../controllers/reservation.controller.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.route("/").get(getReservations).post(formSubmissionLimiter, createReservation);

router
    .route("/:id")
    .get(getReservationById)
    .put(updateReservation)
    .delete(deleteReservation);

export default router;
