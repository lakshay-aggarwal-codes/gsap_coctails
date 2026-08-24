import Reservation from "../models/Reservation.js";
import asyncHandler from "../utils/asyncHandler.js";
 
const createReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.create(req.body);

    res.status(201).json({
        success: true,
        data: reservation,
    });
});
 
const getReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: reservations.length,
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
    getReservationById,
    updateReservation,
    deleteReservation,
};
