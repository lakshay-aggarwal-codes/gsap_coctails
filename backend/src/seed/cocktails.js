import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Cocktail from "../models/Cocktail.js";

const cocktailsToSeed = [
  {
    name: "Mojito",
    category: "cocktail",
    tier: "popular",
    country: "Cuba",
    detail: "Minty Fresh",
    price: "12",
  },
  {
    name: "Margarita",
    category: "cocktail",
    tier: "popular",
    country: "Mexico",
    detail: "Zesty Bold",
    price: "14",
  },
  {
    name: "Piña Colada",
    category: "cocktail",
    tier: "popular",
    country: "Puerto Rico",
    detail: "Tropical Bliss",
    price: "13",
  },
  {
    name: "Old Fashioned",
    category: "cocktail",
    tier: "popular",
    country: "USA",
    detail: "Rich Smooth",
    price: "15",
  },

  {
    name: "Passionfruit Martini",
    category: "cocktail",
    tier: "loved",
    country: "Australia",
    detail: "Fruity Tart",
    price: "14",
  },
  {
    name: "Espresso Martini",
    category: "cocktail",
    tier: "loved",
    country: "UK",
    detail: "Rich Coffee",
    price: "15",
  },
  {
    name: "Strawberry Daiquiri",
    category: "cocktail",
    tier: "loved",
    country: "Cuba",
    detail: "Berry Sweet",
    price: "13",
  },
  {
    name: "Cosmopolitan",
    category: "cocktail",
    tier: "loved",
    country: "USA",
    detail: "Citrus Crisp",
    price: "14",
  },
  {
    name: "Classic Mojito",
    category: "cocktail",
    tier: "popular",
    image: "/images/drink1.png",
    title: "Simple Ingredients, Bold Flavor",
    description:
      "Made with tequila, lime juice, and orange liqueur, the Margarita is easy to make and full of character. Add a salted rim for the perfect drink on summer nights.",
  },
  {
    name: "Raspberry Mojito",
    category: "cocktail",
    tier: "popular",
    image: "/images/drink2.png",
    title: "A Zesty Classic That Never Fails",
    description:
      "The Margarita is a classic that balances tangy lime, smooth tequila, and a touch of sweetness. Shaken, frozen, or on the rocks—it's always crisp & refreshing.",
  },
  {
    name: "Violet Breeze",
    category: "cocktail",
    tier: "popular",
    image: "/images/drink3.png",
    title: "Simple Ingredients, Bold Flavor",
    description:
      "Made with tequila, lime juice, and orange liqueur, the Margarita is easy to make and full of character. Add a salted rim for the perfect drink on summer nights.",
  },
  {
    name: "Curacao Mojito",
    category: "cocktail",
    tier: "popular",
    image: "/images/drink4.png",
    title: "Crafted With Care, Poured With Love",
    description:
      "Each cocktail is made with fresh ingredients and a passion for perfecting every pour, whether you're celebrating or simply relaxing.",
  },
];

const seedCocktails = async () => {
  try {
    await connectDB();

    const deleted = await Cocktail.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing cocktail(s).`);

    const inserted = await Cocktail.insertMany(cocktailsToSeed);
    console.log(`Seeded ${inserted.length} cocktail(s).`);

    await mongoose.disconnect();
    console.log("Done. Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedCocktails();
