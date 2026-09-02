import Reservation from "../models/Reservation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {buildPaginationMeta} from "../utils/pagination.js";
import {validateTimeSlot, reserveSlotCapacity, releaseSlotCapacity} from "../services/reservation.service.js";
import sendMail from "../utils/mailer.js";

const STATUS_LABELS = {
    confirmed: "confirmed",
    cancelled: "cancelled",
    pending: "set back to pending",
    waitlisted: "added to the waitlist",
};

const sendReservationStatusEmail = async (reservation) => {
    const label = STATUS_LABELS[reservation.status] || reservation.status;

    await sendMail({
        to: reservation.email,
        subject: `Your Velvet Pour reservation is ${label}`,
        text: `Hi ${reservation.name}, your reservation for ${reservation.numberOfGuests} guest(s) on ${reservation.date} at ${reservation.time} has been ${label}.`,
        html: `<p>Hi ${reservation.name},</p><p>Your reservation for ${reservation.numberOfGuests} guest(s) on ${reservation.date} at ${reservation.time} has been <strong>${label}</strong>.</p>`,
    });
};

const promoteWaitlist = async ({ date, time }) => {
    const waitlisted = await Reservation.find({ date, time, status: "waitlisted" }).sort({ createdAt: 1 });

    for (const candidate of waitlisted) {
        const reserved = await reserveSlotCapacity({ date, time, numberOfGuests: candidate.numberOfGuests });
        if (!reserved) break;

        candidate.status = "confirmed";
        candidate.statusSeenByCustomer = false;
        await candidate.save();

        sendReservationStatusEmail(candidate).catch((err) => {
            console.error("Failed to send waitlist promotion email:", err.message);
        });
    }
};

const createReservation = asyncHandler(async (req, res) => {
    const { date, time, numberOfGuests } = req.body;

    validateTimeSlot(time);

    const reserved = await reserveSlotCapacity({ date, time, numberOfGuests });
    const status = reserved ? "confirmed" : "waitlisted";

    const reservation = await Reservation.create({
        ...req.body,
        status,
        customer: req.customer?._id ?? null,
    });

    sendReservationStatusEmail(reservation).catch((err) => {
        console.error("Failed to send reservation status email:", err.message);
    });

    res.status(201).json({
        success: true,
        data: reservation,
    });
});

const getReservations = asyncHandler(async (req, res) => {
    const {page, limit} = req.query;
    const skip = (page - 1) * limit;

    const [reservations, total] = await Promise.all([
        Reservation.find().sort({createdAt: -1}).skip(skip).limit(limit).populate("customer", "name email"),
        Reservation.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        data: reservations,
        pagination: buildPaginationMeta({page, limit, total}),
    });
});

const getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ customer: req.customer._id }).sort({ date: -1 });

    res.status(200).json({
        success: true,
        data: reservations,
    });
});

const getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
    }

    res.status(200).json({
        success: true,
        data: reservation,
    });
});

const updateReservation = asyncHandler(async (req, res) => {
    const existing = await Reservation.findById(req.params.id);

    if (!existing) {
        res.status(404);
        throw new Error("Reservation not found");
    }

    const isRebooking = ["date", "time", "numberOfGuests"].some((field) => req.body[field] !== undefined);
    const nextDate = req.body.date ?? existing.date;
    const nextTime = req.body.time ?? existing.time;
    const nextGuests = req.body.numberOfGuests ?? existing.numberOfGuests;

    if (isRebooking) {
        validateTimeSlot(nextTime);
    }

    const requestedStatus = req.body.status;
    const statusChanged = requestedStatus !== undefined && requestedStatus !== existing.status;
    const finalStatus = requestedStatus ?? existing.status;

    const wasHoldingCapacity = existing.status === "confirmed";
    const willHoldCapacity = finalStatus === "confirmed";

    if (isRebooking && wasHoldingCapacity) {
        await releaseSlotCapacity({ date: existing.date, time: existing.time, numberOfGuests: existing.numberOfGuests });
    }

    if (willHoldCapacity && (isRebooking || (statusChanged && !wasHoldingCapacity))) {
        const reserved = await reserveSlotCapacity({ date: nextDate, time: nextTime, numberOfGuests: nextGuests });

        if (!reserved) {
            if (isRebooking && wasHoldingCapacity) {
                await reserveSlotCapacity({ date: existing.date, time: existing.time, numberOfGuests: existing.numberOfGuests });
            }
            res.status(409);
            throw new Error("That time slot is now full");
        }
    } else if (!willHoldCapacity && wasHoldingCapacity && !isRebooking) {
        await releaseSlotCapacity({ date: existing.date, time: existing.time, numberOfGuests: existing.numberOfGuests });
    }

    const updatePayload = statusChanged ? { ...req.body, status: finalStatus, statusSeenByCustomer: false } : req.body;

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, updatePayload, {
        new: true,
        runValidators: true,
    });

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
    }

    if (statusChanged) {
        sendReservationStatusEmail(reservation).catch((err) => {
            console.error("Failed to send reservation status email:", err.message);
        });
    }

    if (wasHoldingCapacity && (!willHoldCapacity || isRebooking)) {
        promoteWaitlist({ date: existing.date, time: existing.time }).catch((err) => {
            console.error("Waitlist promotion failed:", err.message);
        });
    }

    res.status(200).json({
        success: true,
        data: reservation,
    });
});

const cancelMyReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({
        _id: req.params.id,
        customer: req.customer._id,
    });

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
    }

    if (reservation.status === "cancelled") {
        res.status(200).json({
            success: true,
            data: reservation,
        });
        return;
    }

    const wasHoldingCapacity = reservation.status === "confirmed";

    reservation.status = "cancelled";
    await reservation.save();

    if (wasHoldingCapacity) {
        await releaseSlotCapacity({ date: reservation.date, time: reservation.time, numberOfGuests: reservation.numberOfGuests });
        promoteWaitlist({ date: reservation.date, time: reservation.time }).catch((err) => {
            console.error("Waitlist promotion failed:", err.message);
        });
    }

    res.status(200).json({
        success: true,
        data: reservation,
    });
});

const getMyUnseenStatusUpdates = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({
        customer: req.customer._id,
        statusSeenByCustomer: false,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        data: reservations,
    });
});

const acknowledgeStatusUpdates = asyncHandler(async (req, res) => {
    await Reservation.updateMany(
        { customer: req.customer._id, statusSeenByCustomer: false },
        { $set: { statusSeenByCustomer: true } }
    );

    res.status(200).json({
        success: true,
    });
});

const deleteReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
    }

    if (reservation.status === "confirmed") {
        await releaseSlotCapacity({ date: reservation.date, time: reservation.time, numberOfGuests: reservation.numberOfGuests });
        promoteWaitlist({ date: reservation.date, time: reservation.time }).catch((err) => {
            console.error("Waitlist promotion failed:", err.message);
        });
    }

    res.status(200).json({
        success: true,
        data: {},
    });
});

export {
    createReservation,
    getReservations,
    getMyReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
    cancelMyReservation,
    getMyUnseenStatusUpdates,
    acknowledgeStatusUpdates,
};