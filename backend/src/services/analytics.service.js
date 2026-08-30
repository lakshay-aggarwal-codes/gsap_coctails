import Reservation from "../models/Reservation.js";
import Contact from "../models/Contact.js";
import Cocktail from "../models/Cocktail.js";
import Favorite from "../models/Favorite.js";

const getCutoffDateString = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff.toISOString().slice(0, 10);
};

const getReservationsByDate = async (days) => {
    const cutoffDateStr = getCutoffDateString(days);

    return Reservation.aggregate([
        {$match: {date: {$gte: cutoffDateStr}}},
        {
            $group: {
                _id: "$date",
                total: {$sum: 1},
                confirmed: {
                    $sum: {$cond: [{$eq: ["$status", "confirmed"]}, 1, 0]},
                },
                cancelled: {
                    $sum: {$cond: [{$eq: ["$status", "cancelled"]}, 1, 0]},
                },
            },
        },
        {$sort: {_id: 1}},
        {$project: {_id: 0, date: "$_id", total: 1, confirmed: 1, cancelled: 1}},
    ]);
};

const getBusiestSlots = async () => {
    return Reservation.aggregate([
        {$match: {status: {$ne: "cancelled"}}},
        {
            $group: {
                _id: "$time",
                bookings: {$sum: 1},
                totalGuests: {$sum: "$numberOfGuests"},
            },
        },
        {$sort: {bookings: -1}},
        {$limit: 10},
        {$project: {_id: 0, time: "$_id", bookings: 1, totalGuests: 1}},
    ]);
};

const getCocktailBreakdown = async () => {
    return Cocktail.aggregate([
        {
            $group: {
                _id: {category: "$category", tier: "$tier"},
                count: {$sum: 1},
                available: {$sum: {$cond: ["$isAvailable", 1, 0]}},
            },
        },
        {$sort: {"_id.category": 1, "_id.tier": 1}},
        {
            $project: {
                _id: 0,
                category: "$_id.category",
                tier: "$_id.tier",
                count: 1,
                available: 1,
            },
        },
    ]);
};

const getContactVolume = async (days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Contact.aggregate([
        {$match: {createdAt: {$gte: cutoffDate}}},
        {
            $group: {
                _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                total: {$sum: 1},
            },
        },
        {$sort: {_id: 1}},
        {$project: {_id: 0, date: "$_id", total: 1}},
    ]);
};

const getMostLikedCocktails = async () => {
    return Favorite.aggregate([
        {
            $group: {
                _id: "$cocktail",
                likes: {$sum: 1},
            },
        },
        {$sort: {likes: -1}},
        {$limit: 10},
        {

            $lookup: {
                from: "cocktails",
                localField: "_id",
                foreignField: "_id",
                as: "cocktail",
            },
        },

        {$unwind: "$cocktail"},
        {
            $project: {
                _id: 0,
                cocktailId: "$cocktail._id",
                name: "$cocktail.name",
                category: "$cocktail.category",
                tier: "$cocktail.tier",
                likes: 1,
            },
        },
    ]);
};
export {getReservationsByDate, getBusiestSlots, getCocktailBreakdown, getContactVolume, getMostLikedCocktails};