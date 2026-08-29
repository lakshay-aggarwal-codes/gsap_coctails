import Cocktail from "../models/Cocktail.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const escapeRegExp = (string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCocktails = asyncHandler(async (req, res) => {
    const { category, search, page, limit } = req.query;

    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.name = {
            $regex: escapeRegExp(search),
            $options: "i",
        };
    }

    const baseQuery = Cocktail.find(filter).sort({
        createdAt: -1,
    });

    if (page !== undefined || limit !== undefined) {
        const currentPage = Number(page) || 1;
        const pageSize = Number(limit) || 20;

        const skip = (currentPage - 1) * pageSize;

        const [cocktails, total] = await Promise.all([
            Cocktail.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),

            Cocktail.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: cocktails,
            pagination: buildPaginationMeta({
                page: currentPage,
                limit: pageSize,
                total,
            }),
        });
    }

    const cocktails = await baseQuery;

    res.status(200).json({
        success: true,
        count: cocktails.length,
        data: cocktails,
    });
});


const getCocktailById = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.findById(req.params.id);

    if (!cocktail) {
        return res.status(404).json({
            success: false,
            message: "Cocktail not found",
        });
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
    const cocktail = await Cocktail.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!cocktail) {
        return res.status(404).json({
            success: false,
            message: "Cocktail not found",
        });
    }

    res.status(200).json({
        success: true,
        data: cocktail,
    });
});


const deleteCocktail = asyncHandler(async (req, res) => {
    const cocktail = await Cocktail.findByIdAndDelete(req.params.id);

    if (!cocktail) {
        return res.status(404).json({
            success: false,
            message: "Cocktail not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Cocktail deleted successfully",
    });
});


export {
    getCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail,
};