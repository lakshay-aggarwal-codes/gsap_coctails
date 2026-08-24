import express from "express";
import {
    getCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail,
} from "../controllers/cocktail.controller.js";

const router = express.Router();

router.route("/").get(getCocktails).post(createCocktail);

router
    .route("/:id")
    .get(getCocktailById)
    .put(updateCocktail)
    .delete(deleteCocktail);

export default router;
