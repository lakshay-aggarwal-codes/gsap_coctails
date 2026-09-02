import { z } from "zod";
import RESERVATION_RULES from "../config/reservationRules.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const isValidCalendarDate = (value) => {
    if (!DATE_REGEX.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const isNotInThePast = (value) => value >= new Date().toISOString().slice(0, 10);

const dateField = z
    .string()
    .refine(isValidCalendarDate, "date must be a valid calendar date in YYYY-MM-DD format");

const futureDateField = dateField.refine(isNotInThePast, "date cannot be in the past");

const timeField = z.string().regex(TIME_REGEX, "time must be in 24-hour HH:mm format");

const guestCountField = z.coerce
    .number()
    .int()
    .min(1, "at least 1 guest is required")
    .max(
        RESERVATION_RULES.MAX_PARTY_SIZE,
        `parties larger than ${RESERVATION_RULES.MAX_PARTY_SIZE} must contact us directly`
    );

const createReservationSchema = z.object({
    name: z.string().trim().min(1, "name is required").max(100),
    email: z.string().trim().email("a valid email is required"),
    phone: z.string().trim().min(1, "phone is required").max(20),
    date: futureDateField,
    time: timeField,
    numberOfGuests: guestCountField,
    specialRequest: z.string().trim().max(500).optional(),
});

const updateReservationSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    date: dateField.optional(),
    time: timeField.optional(),
    numberOfGuests: guestCountField.optional(),
    specialRequest: z.string().trim().max(500).optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "waitlisted"]).optional(),
});

export { createReservationSchema, updateReservationSchema };