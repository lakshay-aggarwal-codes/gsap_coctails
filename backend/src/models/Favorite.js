import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        cocktail: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cocktail",
            required: true,
        },
    },
    { timestamps: true }
);

favoriteSchema.index({ customer: 1, cocktail: 1 }, { unique: true });
favoriteSchema.index({ cocktail: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;