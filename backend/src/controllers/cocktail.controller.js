import Cocktail from "../models/Cocktail.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCocktails = asyncHandler(async (req, res) => {
    const { category, search, page, limit } = req.query;
    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.name = { $regex: escapeRegExp(search), $options: "i" };
    }

    const baseQuery = Cocktail.find(filter).sort({ createdAt: -1 });

    if (page !== undefined || limit !== undefined) {
        const currentPage = page ?? 1;
        const pageSize = limit ?? 20;
        const skip = (currentPage - 1) * pageSize;

        const [cocktails, total] = await Promise.all([
            baseQuery.skip(skip).limit(pageSize),
            Cocktail.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: cocktails,
            pagination: buildPaginationMeta({ page: currentPage, limit: pageSize, total }),
        });
    }

    const cocktails = await baseQuery;

    res.status(200).json({
        success: true,
        count: cocktails.length,
        data: cocktails,
    });
});

// getCocktailById, createCocktail, updateCocktail, deleteCocktail: unchanged