import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchReservationsAdmin, updateReservationStatus } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import useAuthGuard from "../../hooks/useAuthGuard.js";
import { useState } from "react";

const STATUS_OPTIONS = ["pending", "confirmed", "waitlisted", "cancelled"];
const statusClass = { pending: "text-yellow", confirmed: "text-green-400", waitlisted: "text-orange-400", cancelled: "text-red-400" };const PAGE_SIZE = 10;


const Reservations = () => {
    const [page, setPage] = useState(1);
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = useQuery({
        queryKey: ["reservations", page, PAGE_SIZE],
        queryFn: () => fetchReservationsAdmin({ token, page, limit: PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateReservationStatus({ token, id, status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
    });

    useAuthGuard(error);

    const reservations = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div>
            <h1 className="font-serif text-3xl mb-6">Reservations</h1>

            {isLoading && <p className="text-white-100/60">Loading...</p>}
            {error && !isLoading && <p className="text-red-400">{error.message}</p>}

            {!isLoading && !error && (
                <>
                    <div className="overflow-x-auto border border-white-100/10">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-white-100/10 text-left text-white-100/60">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Date &amp; Time</th>
                                <th className="px-4 py-3">Guests</th>
                                <th className="px-4 py-3">Request</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reservations.map((r) => (
                                <tr key={r._id} className="border-b border-white-100/5 last:border-0">
                                    <td className="px-4 py-3">{r.name}</td>
                                    <td className="px-4 py-3">
                                        <div>{r.email}</div>
                                        <div className="text-white-100/50">{r.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">{r.date} &middot; {r.time}</td>
                                    <td className="px-4 py-3">{r.numberOfGuests}</td>
                                    <td className="px-4 py-3 text-white-100/60 max-w-xs truncate">
                                        {r.specialRequest || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={r.status}
                                            onChange={(e) =>
                                                statusMutation.mutate({ id: r._id, status: e.target.value })
                                            }
                                            className={`bg-black border border-white-100/20 px-2 py-1 ${statusClass[r.status] || ""}`}
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {reservations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-white-100/50">
                                        No reservations on this page.
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

export default Reservations;