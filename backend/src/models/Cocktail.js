import mongoose from "mongoose";
 
const cocktailSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: ["cocktail", "mocktail"],
            required: [true, "Category is required"],
        },
        tier: {
            type: String,
            enum: ["popular", "loved"],
            required: [true, "Tier is required"],
        },
        country: {
            type: String,
            trim: true,
        },
        detail: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

cocktailSchema.index({ category: 1 });
cocktailSchema.index({ createdAt: -1 });

const Cocktail = mongoose.model("Cocktail", cocktailSchema);

export default Cocktail;
