import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyFavorites, unlikeCocktail } from "../../services/api.js";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import useCustomerAuthGuard from "../../hooks/useCustomerAuthGuard.js";

const MyFavorites = () => {
    const { token } = useCustomerAuth();
    const queryClient = useQueryClient();

    const favoritesQuery = useQuery({
        queryKey: ["customer", "favorites"],
        queryFn: () => fetchMyFavorites({ token }),
    });

    useCustomerAuthGuard(favoritesQuery.error);

    const unlikeMutation = useMutation({
        mutationFn: (cocktailId) => unlikeCocktail({ token, cocktailId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer", "favorites"] });
        },
    });

    if (favoritesQuery.isLoading) {
        return <p className="text-white-100/60">Loading...</p>;
    }

    if (favoritesQuery.error) {
        return (
            <div>
                <p className="text-red-400 mb-4">Something went wrong loading your favorites.</p>
                <button
                    onClick={() => favoritesQuery.refetch()}
                    className="rounded-full border border-white-100/20 px-4 py-2 text-sm hover:border-yellow hover:text-yellow transition-colors"
                >
                    Try again
                </button>
            </div>
        );
    }

    const favorites = favoritesQuery.data ?? [];

    return (
        <div>
            <h1 className="font-serif text-3xl mb-8">Favorites</h1>

            {favorites.length === 0 && (
                <p className="text-white-100/60">
                    You haven't liked any cocktails yet - look for the heart icon on the menu.
                </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((cocktail) => (
                    <div
                        key={cocktail._id}
                        className="rounded-lg bg-white/5 border border-white/10 p-5 flex flex-col justify-between"
                    >
                        <div>
                            <p className="font-serif text-lg">{cocktail.name}</p>
                            <p className="text-sm text-white-100/50 capitalize">
                                {cocktail.category} - {cocktail.tier}
                            </p>
                        </div>
                        <button
                            onClick={() => unlikeMutation.mutate(cocktail._id)}
                            disabled={unlikeMutation.isPending}
                            className="mt-4 self-start text-sm text-white-100/60 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                            ♥ Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyFavorites;