import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    fetchReservationsByDate,
    fetchBusiestSlots,
    fetchCocktailBreakdown,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import useAuthGuard from "../../hooks/useAuthGuard.js";

const sections = [
    { to: "/admin/reservations", label: "Reservations", description: "View and update table bookings." },
    { to: "/admin/contact", label: "Messages", description: "Read messages submitted through the contact form." },
    { to: "/admin/cocktails", label: "Cocktails", description: "Manage the menu shown on the public site." },
];

const CHART_COLOR = "#e5c07b";
const CHART_COLOR_SECONDARY = "#7bafe5";

const ChartPanel = ({ title, isLoading, error, isEmpty, children }) => (
    <div className="border border-white-100/10 p-5">
        <p className="text-lg mb-4">{title}</p>
        {isLoading && <p className="text-sm text-white-100/60">Loading...</p>}
        {!isLoading && error && (
            <p className="text-sm text-red-400">Couldn't load this chart.</p>
        )}
        {!isLoading && !error && isEmpty && (
            <p className="text-sm text-white-100/60">No data yet.</p>
        )}
        {!isLoading && !error && !isEmpty && children}
    </div>
);

const DashboardHome = () => {
    const { token } = useAuth();

    const reservationsQuery = useQuery({
        queryKey: ["analytics", "reservations-by-date"],
        queryFn: () => fetchReservationsByDate({ token, days: 30 }),
    });

    const slotsQuery = useQuery({
        queryKey: ["analytics", "busiest-slots"],
        queryFn: () => fetchBusiestSlots({ token }),
    });

    const breakdownQuery = useQuery({
        queryKey: ["analytics", "cocktail-breakdown"],
        queryFn: () => fetchCocktailBreakdown({ token }),
    });

    useAuthGuard(reservationsQuery.error);
    useAuthGuard(slotsQuery.error);
    useAuthGuard(breakdownQuery.error);

    const reservationsData = reservationsQuery.data ?? [];
    const slotsData = slotsQuery.data ?? [];
    const breakdownData = (breakdownQuery.data ?? []).map((row) => ({
        ...row,
        label: `${row.category} / ${row.tier}`,
    }));

    return (
        <div>
            <h1 className="font-serif text-3xl mb-8">Overview</h1>

            <div className="grid gap-4 sm:grid-cols-3 mb-10">
                {sections.map((section) => (
                    <Link
                        key={section.to}
                        to={section.to}
                        className="border border-white-100/10 p-5 hover:border-yellow transition-colors"
                    >
                        <p className="text-lg mb-1">{section.label}</p>
                        <p className="text-sm text-white-100/60">{section.description}</p>
                    </Link>
                ))}
            </div>

            <h2 className="font-serif text-2xl mb-4">Analytics</h2>
            <div className="grid gap-4 lg:grid-cols-2">
                <ChartPanel
                    title="Reservations - last 30 days"
                    isLoading={reservationsQuery.isLoading}
                    error={reservationsQuery.error}
                    isEmpty={reservationsData.length === 0}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={reservationsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel
                    title="Busiest time slots"
                    isLoading={slotsQuery.isLoading}
                    error={slotsQuery.error}
                    isEmpty={slotsData.length === 0}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={slotsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="bookings" fill={CHART_COLOR} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel
                    title="Menu breakdown"
                    isLoading={breakdownQuery.isLoading}
                    error={breakdownQuery.error}
                    isEmpty={breakdownData.length === 0}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={breakdownData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill={CHART_COLOR} name="Total" />
                            <Bar dataKey="available" fill={CHART_COLOR_SECONDARY} name="Available" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
        </div>
    );
};

export default DashboardHome;