import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyReservations, cancelMyReservation } from "../../services/api.js";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import useCustomerAuthGuard from "../../hooks/useCustomerAuthGuard.js";

const statusClass = { pending: "text-yellow", confirmed: "text-green-400", waitlisted: "text-orange-400", cancelled: "text-red-400" };

const todayStr = () => new Date().toISOString().slice(0, 10);

const ReservationCard = ({ reservation, onCancel, isCancelling }) => {
    const canCancel = reservation.status !== "cancelled" && reservation.date >= todayStr();

    return (
        <div className="rounded-lg bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-2">
                <p className="font-serif text-lg">
                    {reservation.date} at {reservation.time}
                </p>
                <span className={`text-sm capitalize ${statusClass[reservation.status] || ""}`}>
                    {reservation.status}
                </span>
            </div>
            <p className="text-sm text-white-100/60">
                {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? "guest" : "guests"}
            </p>
            {reservation.specialRequest && (
                <p className="text-sm text-white-100/60 mt-2 italic">"{reservation.specialRequest}"</p>
            )}
            {canCancel && (
                <button
                    onClick={() => onCancel(reservation._id)}
                    disabled={isCancelling}
                    className="mt-4 text-sm text-white-100/60 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                    Cancel reservation
                </button>
            )}
        </div>
    );
};

const MyReservations = () => {
    const { token } = useCustomerAuth();
    const queryClient = useQueryClient();

    const reservationsQuery = useQuery({
        queryKey: ["customer", "reservations"],
        queryFn: () => fetchMyReservations({ token }),
    });

    useCustomerAuthGuard(reservationsQuery.error);

    const cancelMutation = useMutation({
        mutationFn: (id) => cancelMyReservation({ token, id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer", "reservations"] });
        },
    });

    if (reservationsQuery.isLoading) {
        return <p className="text-white-100/60">Loading...</p>;
    }

    if (reservationsQuery.error) {
        return (
            <div>
                <p className="text-red-400 mb-4">Something went wrong loading your reservations.</p>
                <button
                    onClick={() => reservationsQuery.refetch()}
                    className="rounded-full border border-white-100/20 px-4 py-2 text-sm hover:border-yellow hover:text-yellow transition-colors"
                >
                    Try again
                </button>
            </div>
        );
    }

    const reservations = reservationsQuery.data ?? [];
    const today = todayStr();
    const upcoming = reservations.filter((r) => r.date >= today);
    const past = reservations.filter((r) => r.date < today);

    return (
        <div>
            <h1 className="font-serif text-3xl mb-8">My Reservations</h1>

            {reservations.length === 0 && (
                <p className="text-white-100/60">You haven't made a reservation yet.</p>
            )}

            {upcoming.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-sm uppercase tracking-wide text-white-100/50 mb-4">Upcoming</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {upcoming.map((r) => (
                            <ReservationCard
                                key={r._id}
                                reservation={r}
                                onCancel={cancelMutation.mutate}
                                isCancelling={cancelMutation.isPending && cancelMutation.variables === r._id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div>
                    <h2 className="text-sm uppercase tracking-wide text-white-100/50 mb-4">Past</h2>
                    <div className="grid gap-4 sm:grid-cols-2 opacity-60">
                        {past.map((r) => (
                            <ReservationCard key={r._id} reservation={r} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReservations;