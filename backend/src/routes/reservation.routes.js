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
import validate from "../middleware/validate.middleware.js";
import {paginationQuerySchema} from "../validators/pagination.validators.js";
import {createReservationSchema, updateReservationSchema} from "../validators/reservation.validators.js";

const router = express.Router();

router
    .route("/:id")
    .get(protect, getReservationById)
    .put(protect, validate(updateReservationSchema), updateReservation)
    .delete(protect, deleteReservation);

router
    .route("/")
    .get(protect, validate(paginationQuerySchema, "query"), getReservations)
    .post(formSubmissionLimiter, validate(createReservationSchema), createReservation);

export default router;