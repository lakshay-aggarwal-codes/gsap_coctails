import Favorite from "../models/Favorite.js";
const attachLikedFlag = async (cocktails, customerId) => {
    if (!customerId) {
        return cocktails;
    }

    const cocktailIds = cocktails.map((c) => c._id);
    const favorites = await Favorite.find({
        customer: customerId,
        cocktail: { $in: cocktailIds },
    }).select("cocktail");

    const likedSet = new Set(favorites.map((f) => f.cocktail.toString()));

    return cocktails.map((cocktail) => ({
        ...cocktail,
        isLikedByMe: likedSet.has(cocktail._id.toString()),
    }));
};

export default attachLikedFlag;