import express from "express";
import { likeCocktail, unlikeCocktail } from "../controllers/favorite.controller.js";
import protectCustomer from "../middleware/protectCustomer.middleware.js";

const router = express.Router();

router.use(protectCustomer);

router
    .route("/:cocktailId")
    .post(likeCocktail)
    .delete(unlikeCocktail);

export default router;