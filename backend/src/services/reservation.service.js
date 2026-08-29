import Reservation from "../models/Reservation.js";
import AppError from "../utils/AppError.js";
import RESERVATION_RULES from "../config/reservationRules.js";

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const validateTimeSlot = (time) => {
    const { OPENING_TIME, CLOSING_TIME, SLOT_INTERVAL_MINUTES } = RESERVATION_RULES;

    const requested = timeToMinutes(time);
    const opening = timeToMinutes(OPENING_TIME);
    const closing = timeToMinutes(CLOSING_TIME);

    if (requested < opening || requested >= closing) {
        throw new AppError(`We only accept reservations between ${OPENING_TIME} and ${CLOSING_TIME}.`, 400);
    }

    if ((requested - opening) % SLOT_INTERVAL_MINUTES !== 0) {
        const nextSlot = minutesToTime(opening + SLOT_INTERVAL_MINUTES);
        throw new AppError(
            `Please select a time in ${SLOT_INTERVAL_MINUTES}-minute intervals starting from ${OPENING_TIME} (e.g. ${OPENING_TIME}, ${nextSlot}).`,
            400
        );
    }
};

const checkAvailability = async ({ date, time, numberOfGuests, excludeReservationId }) => {
    const filter = {
        date,
        time,
        status: { $ne: "cancelled" },
    };

    if (excludeReservationId) {
        filter._id = { $ne: excludeReservationId };
    }

    const existingReservations = await Reservation.find(filter).select("numberOfGuests");
    const bookedGuests = existingReservations.reduce((sum, r) => sum + r.numberOfGuests, 0);
    const remaining = RESERVATION_RULES.MAX_GUESTS_PER_SLOT - bookedGuests;

    if (numberOfGuests > remaining) {
        if (remaining <= 0) {
            throw new AppError(`Sorry, we're fully booked for ${time} on ${date}. Please choose another time.`, 409);
        }
        throw new AppError(
            `Only ${remaining} seat${remaining === 1 ? "" : "s"} left for ${time} on ${date} — please reduce your party size or choose another time.`,
            409
        );
    }
};

export { validateTimeSlot, checkAvailability };