import express from "express";
import {
    createContactMessage,
    getContactMessages,
    getContactMessageById,
    deleteContactMessage,
} from "../controllers/contact.controller.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {paginationQuerySchema} from "../validators/pagination.validators.js";

const router = express.Router();

router
    .route("/")
    .get(protect, validate(paginationQuerySchema, "query"), getContactMessages)
    .post(formSubmissionLimiter, createContactMessage);

router
    .route("/:id")
    .get(protect, getContactMessageById)
    .delete(protect, deleteContactMessage);

export default router;  