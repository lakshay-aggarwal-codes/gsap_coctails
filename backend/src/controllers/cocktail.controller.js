import Cocktail from "../models/Cocktail.js";
import asyncHandler from "../utils/asyncHandler.js";
 
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
const getCocktails = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) { 
        filter.name = { $regex: escapeRegExp(search), $options: "i" };
    }

    const cocktails = await Cocktail.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: cocktails.length,
        data: cocktails,
    });
});
 
const getCocktailById = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.findById(req.params.id);

    if (!cocktail) {
        res.status(404);
        throw new Error("Cocktail not found");
    }

    res.status(200).json({
        success: true,
        data: cocktail,
    });
});
 
const createCocktail = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.create(req.body);

    res.status(201).json({
        success: true,
        data: cocktail,
    });
});
 
const updateCocktail = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true, 
    });

    if (!cocktail) {
        res.status(404);
        throw new Error("Cocktail not found");
    }

    res.status(200).json({
        success: true,
        data: cocktail,
    });
});
 
const deleteCocktail = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.findByIdAndDelete(req.params.id);

    if (!cocktail) {
        res.status(404);
        throw new Error("Cocktail not found");
    }

    res.status(200).json({
        success: true,
        data: {},
    });
});

export {
    getCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail,
};
