import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchCocktailsAdmin, createCocktail, updateCocktail, deleteCocktail } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import useAuthGuard from "../../hooks/useAuthGuard.js";
import CocktailForm from "../../components/admin/CocktailForm.jsx";

const PAGE_SIZE = 10;

const Cocktails = () => {
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCocktail, setEditingCocktail] = useState(null); // null = create mode when form is open
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = useQuery({
        queryKey: ["cocktailsAdmin", page, PAGE_SIZE, token],
        queryFn: () =>
            fetchCocktailsAdmin({
                token,
                page,
                limit: PAGE_SIZE,
            }),
        enabled: Boolean(token),
        placeholderData: keepPreviousData,
    });

    useAuthGuard(error);

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cocktailsAdmin"] });

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingCocktail(null);
    };

    const createMutation = useMutation({
        mutationFn: (cocktail) => createCocktail({ token, cocktail }),
        onSuccess: () => { invalidate(); closeForm(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, cocktail }) => updateCocktail({ token, id, cocktail }),
        onSuccess: () => { invalidate(); closeForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteCocktail({ token, id }),
        onSuccess: invalidate,
    });

    const handleSubmit = (formValues) => {
        if (editingCocktail) {
            updateMutation.mutate({ id: editingCocktail._id, cocktail: formValues });
        } else {
            createMutation.mutate(formValues);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this cocktail? This cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const cocktails = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-serif text-3xl">Cocktails</h1>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="border border-yellow text-yellow px-4 py-2 hover:bg-yellow hover:text-black transition-colors"
                    >
                        Add cocktail
                    </button>
                )}
            </div>

            {isFormOpen && (
                <CocktailForm
                    initialValues={editingCocktail}
                    onSubmit={handleSubmit}
                    onCancel={closeForm}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {isLoading && <p className="text-white-100/60">Loading...</p>}
            {error && error.status !== 401 && !isLoading && <p className="text-red-400">{error.message}</p>}

            {!isLoading && !error && (
                <>
                    <div className="overflow-x-auto border border-white-100/10">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-white-100/10 text-left text-white-100/60">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Tier</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Available</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cocktails.map((c) => (
                                <tr key={c._id} className="border-b border-white-100/5 last:border-0">
                                    <td className="px-4 py-3">{c.name}</td>
                                    <td className="px-4 py-3">{c.category}</td>
                                    <td className="px-4 py-3">{c.tier}</td>
                                    <td className="px-4 py-3">{c.price != null ? `$${c.price}` : "—"}</td>
                                    <td className="px-4 py-3">{c.isAvailable ? "Yes" : "No"}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => { setEditingCocktail(c); setIsFormOpen(true); }}
                                            className="border border-white-100/20 px-2 py-1 hover:border-yellow hover:text-yellow transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c._id)}
                                            className="border border-white-100/20 px-2 py-1 hover:border-red-400 hover:text-red-400 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {cocktails.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-white-100/50">
                                        No cocktails on this page.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && (
                        <div className="flex items-center justify-between mt-4 text-sm text-white-100/60">
                            <span>
                                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => p - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="border border-white-100/20 px-3 py-1 disabled:opacity-30 hover:border-yellow hover:text-yellow"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="border border-white-100/20 px-3 py-1 disabled:opacity-30 hover:border-yellow hover:text-yellow"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Cocktails;