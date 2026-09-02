import { useEffect, useState } from "react";
import { fetchUnseenStatusUpdates, acknowledgeStatusUpdates } from "../services/api.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const STATUS_TEXT = {
    confirmed: "confirmed",
    cancelled: "cancelled",
    pending: "set back to pending",
    waitlisted: "added to the waitlist",
};

const STATUS_COLOR = {
    confirmed: "border-green-400/40 bg-green-400/10 text-green-300",
    cancelled: "border-red-400/40 bg-red-400/10 text-red-300",
    pending: "border-yellow/40 bg-yellow/10 text-yellow",
    waitlisted: "border-orange-400/40 bg-orange-400/10 text-orange-300",
};

const StatusUpdateBanner = () => {
    const { token, isAuthenticated } = useCustomerAuth();
    const [updates, setUpdates] = useState([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;

        fetchUnseenStatusUpdates({ token })
            .then((data) => {
                if (isMounted) setUpdates(data || []);
            })
            .catch(() => {
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, token]);

    if (!isAuthenticated || dismissed || updates.length === 0) {
        return null;
    }

    const handleDismiss = () => {
        setDismissed(true);
        acknowledgeStatusUpdates({ token }).catch(() => {
        });
    };

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
            <div className="w-full max-w-xl rounded-lg border bg-black/95 backdrop-blur px-5 py-4 shadow-lg space-y-2">
                {updates.map((reservation) => (
                    <div
                        key={reservation._id}
                        className={`rounded-md border px-3 py-2 text-sm ${STATUS_COLOR[reservation.status] || "border-white/20 bg-white/5 text-white"}`}
                    >
                        Your reservation for {reservation.date} at {reservation.time} has been{" "}
                        <strong>{STATUS_TEXT[reservation.status] || reservation.status}</strong>.
                    </div>
                ))}
                <button
                    onClick={handleDismiss}
                    className="w-full text-center text-xs text-white-100/60 hover:text-white-100 pt-1"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default StatusUpdateBanner;