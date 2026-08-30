import asyncHandler from "../utils/asyncHandler.js";
import {
    getReservationsByDate,
    getBusiestSlots,
    getCocktailBreakdown,
    getContactVolume,
    getMostLikedCocktails,
} from "../services/analytics.service.js";

const reservationsByDate = asyncHandler(async (req, res) => {
    const { days } = req.query;
    const data = await getReservationsByDate(days);
    res.status(200).json({ success: true, data });
});

const busiestSlots = asyncHandler(async (req, res) => {
    const data = await getBusiestSlots();
    res.status(200).json({ success: true, data });
});

const cocktailBreakdown = asyncHandler(async (req, res) => {
    const data = await getCocktailBreakdown();
    res.status(200).json({ success: true, data });
});

const contactVolume = asyncHandler(async (req, res) => {
    const { days } = req.query;
    const data = await getContactVolume(days);
    res.status(200).json({ success: true, data });
});

const mostLikedCocktails = asyncHandler(async (req, res) => {
    const data = await getMostLikedCocktails();
    res.status(200).json({ success: true, data });
});

export {
    reservationsByDate,
    busiestSlots,
    cocktailBreakdown,
    contactVolume,
    mostLikedCocktails,
};