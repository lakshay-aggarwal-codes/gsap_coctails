import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";

const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm transition-colors ${
        isActive ? "text-yellow border-b border-yellow" : "text-white-100/60 hover:text-white-100"
    }`;

const AccountLayout = () => {
    const { customer, logout } = useCustomerAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/account/login", { replace: true });
    };

    return (
        <div className="min-h-dvh w-full bg-black text-white-100">
            <header className="border-b border-white-100/10">
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <NavLink to="/" className="font-modern-negra text-2xl text-yellow">
                        Velvet Pour
                    </NavLink>

                    <nav className="account-nav flex gap-1">
                        <NavLink to="/account" end className={navLinkClass}>Profile</NavLink>
                        <NavLink to="/account/my-reservations" className={navLinkClass}>My Reservations</NavLink>
                        <NavLink to="/account/favorites" className={navLinkClass}>Favorites</NavLink>
                    </nav>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-white-100/60">{customer?.name}</span>
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

export default AccountLayout;
