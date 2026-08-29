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

export { validateTimeSlot };