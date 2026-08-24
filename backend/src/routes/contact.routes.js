import express from "express";
import {
    createContactMessage,
    getContactMessages,
    getContactMessageById,
    deleteContactMessage,
} from "../controllers/contact.controller.js";
import formSubmissionLimiter from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.route("/").get(getContactMessages).post(formSubmissionLimiter, createContactMessage);

router.route("/:id").get(getContactMessageById).delete(deleteContactMessage);

export default router;
