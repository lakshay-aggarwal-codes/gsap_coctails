import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm transition-colors ${
        isActive ? "text-yellow border-b border-yellow" : "text-white-100/60 hover:text-white-100"
    }`;

const DashboardLayout = () => {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-dvh w-full bg-black text-white-100">
            <header className="border-b border-white-100/10">
                <div className="container mx-auto flex items-center justify-between px-5 py-4">
                    <p className="font-modern-negra text-2xl text-yellow">Velvet Pour</p>

                    <nav className="admin-nav flex gap-1">
                        <NavLink to="/admin" end className={navLinkClass}>Overview</NavLink>
                        <NavLink to="/admin/reservations" className={navLinkClass}>Reservations</NavLink>
                        <NavLink to="/admin/contact" className={navLinkClass}>Messages</NavLink>
                        <NavLink to="/admin/cocktails" className={navLinkClass}>Cocktails</NavLink>
                    </nav>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-white-100/60">Signed in as {admin?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="border border-white-100/20 px-3 py-1 hover:border-yellow hover:text-yellow transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-5 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;