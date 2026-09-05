import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchContactMessagesAdmin, deleteContactMessage } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import useAuthGuard from "../../hooks/useAuthGuard.js";

const PAGE_SIZE = 10;

const Contacts = () => {
    const [page, setPage] = useState(1);
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = useQuery({
        queryKey: ["contactMessages", page, PAGE_SIZE],
        queryFn: () => fetchContactMessagesAdmin({ token, page, limit: PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });

    useAuthGuard(error);

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteContactMessage({ token, id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contactMessages"] }),
    });

    const messages = data?.data ?? [];
    const pagination = data?.pagination;

    const handleDelete = (id) => {
        if (window.confirm("Delete this message? This cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div>
            <h1 className="font-serif text-3xl mb-6">Messages</h1>

            {isLoading && <p className="text-white-100/60">Loading...</p>}
            {error && error.status !== 401 && !isLoading && (
                <p className="text-red-400">{error.message}</p>
            )}

            {!isLoading && !error && (
                <>
                    <div className="flex flex-col gap-3">
                        {messages.map((m) => (
                            <div key={m._id} className="border border-white-100/10 p-4 flex justify-between gap-4">
                                <div>
                                    <p className="text-white-100">
                                        {m.name} <span className="text-white-100/50 text-sm">&lt;{m.email}&gt;</span>
                                    </p>
                                    <p className="text-white-100/70 text-sm mt-1">{m.message}</p>
                                    <p className="text-white-100/40 text-xs mt-2">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(m._id)}
                                    className="self-start border border-white-100/20 px-3 py-1 text-sm hover:border-red-400 hover:text-red-400 transition-colors shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <p className="text-white-100/50 text-center py-6">No messages on this page.</p>
                        )}
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

export default Contacts;