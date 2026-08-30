import express from "express";
import {
    getCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail,
} from "../controllers/cocktail.controller.js";
import protect from "../middleware/auth.middleware.js";
import optionalCustomerAuth from "../middleware/optionalCustomerAuth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    cocktailQuerySchema,
    cocktailCreateSchema,
    cocktailUpdateSchema,
} from "../validators/cocktail.validators.js";

const router = express.Router();

router
    .route("/")
    .get(optionalCustomerAuth, validate(cocktailQuerySchema, "query"), getCocktails)
    .post(protect, validate(cocktailCreateSchema), createCocktail);

router
    .route("/:id")
    .get(optionalCustomerAuth, getCocktailById)
    .put(protect, validate(cocktailUpdateSchema), updateCocktail)
    .delete(protect, deleteCocktail);

export default router;