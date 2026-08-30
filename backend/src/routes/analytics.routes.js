import express from "express";
import {
    reservationsByDate,
    busiestSlots,
    cocktailBreakdown,
    contactVolume,
} from "../controllers/analytics.controller.js";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { trendQuerySchema } from "../validators/analytics.validators.js";

const router = express.Router();

router.use(protect);

router.get("/reservations-by-date", validate(trendQuerySchema, "query"), reservationsByDate);
router.get("/busiest-slots", busiestSlots);
router.get("/cocktail-breakdown", cocktailBreakdown);
router.get("/contact-volume", validate(trendQuerySchema, "query"), contactVolume);

export default router;