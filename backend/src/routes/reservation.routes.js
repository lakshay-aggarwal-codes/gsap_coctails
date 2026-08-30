import express from "express";
import {
    createReservation,
    getReservations,
    getMyReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
} from "../controllers/reservation.controller.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";
import protect from "../middleware/auth.middleware.js";
import protectCustomer from "../middleware/protectCustomer.middleware.js";
import optionalCustomerAuth from "../middleware/optionalCustomerAuth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {paginationQuerySchema} from "../validators/pagination.validators.js";
import {createReservationSchema, updateReservationSchema} from "../validators/reservation.validators.js";

const router = express.Router();

router.get("/mine", protectCustomer, getMyReservations);

router
    .route("/:id")
    .get(protect, getReservationById)
    .put(protect, validate(updateReservationSchema), updateReservation)
    .delete(protect, deleteReservation);

router
    .route("/")
    .get(protect, validate(paginationQuerySchema, "query"), getReservations)
    .post(formSubmissionLimiter, optionalCustomerAuth, validate(createReservationSchema), createReservation);

export default router;