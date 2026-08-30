import Cocktail from "../models/Cocktail.js";
import Favorite from "../models/Favorite.js";
import asyncHandler from "../utils/asyncHandler.js";

const likeCocktail = asyncHandler(async (req, res) => {
    const { cocktailId } = req.params;

    const cocktail = await Cocktail.findById(cocktailId);
    if (!cocktail) {
        res.status(404);
        throw new Error("Cocktail not found");
    }

    await Favorite.findOneAndUpdate(
        { customer: req.customer._id, cocktail: cocktailId },
        { customer: req.customer._id, cocktail: cocktailId },
        { upsert: true, new: true }
    );

    res.status(200).json({
        success: true,
        data: { cocktailId, liked: true },
    });
});

const unlikeCocktail = asyncHandler(async (req, res) => {
    const { cocktailId } = req.params;


    await Favorite.deleteOne({ customer: req.customer._id, cocktail: cocktailId });

    res.status(200).json({
        success: true,
        data: { cocktailId, liked: false },
    });
});

const getMyFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ customer: req.customer._id })
        .sort({ createdAt: -1 })
        .populate("cocktail");

    res.status(200).json({
        success: true,

        data: favorites.map((f) => f.cocktail).filter(Boolean),
    });
});

export { likeCocktail, unlikeCocktail, getMyFavorites };