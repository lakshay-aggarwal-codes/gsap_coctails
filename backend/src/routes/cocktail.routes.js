import express from "express";
import {
    getCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail,
} from "../controllers/cocktail.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getCocktails).post(protect, createCocktail);

router
    .route("/:id")
    .get(getCocktailById)
    .put(protect, updateCocktail)
    .delete(protect, deleteCocktail);

export default router;