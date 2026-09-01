import Reservation from "../models/Reservation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {buildPaginationMeta} from "../utils/pagination.js";
import {validateTimeSlot,checkAvailability } from "../services/reservation.service.js";

const createReservation = asyncHandler(async (req, res) => {
    const { date, time, numberOfGuests } = req.body;

    validateTimeSlot(time);
    await checkAvailability({ date, time, numberOfGuests });

    const reservation = await Reservation.create({
        ...req.body,
        customer: req.customer?._id ?? null,
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
    const isRebooking = ["date", "time", "numberOfGuests"].some((field) => req.body[field] !== undefined);

    if (isRebooking) {
        const existing = await Reservation.findById(req.params.id);

        if (!existing) {
            res.status(404);
            throw new Error("Reservation not found");
        }

        const date = req.body.date ?? existing.date;
        const time = req.body.time ?? existing.time;
        const numberOfGuests = req.body.numberOfGuests ?? existing.numberOfGuests;

        validateTimeSlot(time);
        await checkAvailability({ date, time, numberOfGuests, excludeReservationId: req.params.id });
    }

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
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

    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({
        success: true,
        data: reservation,
    });
});

const deleteReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error("Reservation not found");
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
};