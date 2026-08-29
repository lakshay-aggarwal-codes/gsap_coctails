import React from "react";
import { Link } from "react-router-dom";

const sections = [
    { to: "/admin/reservations", label: "Reservations", description: "View and update table bookings." },
    { to: "/admin/contact", label: "Messages", description: "Read messages submitted through the contact form." },
    { to: "/admin/cocktails", label: "Cocktails", description: "Manage the menu shown on the public site." },
];

const DashboardHome = () => {
    return (
        <div>
            <h1 className="font-serif text-3xl mb-8">Overview</h1>

            <div className="grid gap-4 sm:grid-cols-3">
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
        </div>
    );
};

export default DashboardHome;