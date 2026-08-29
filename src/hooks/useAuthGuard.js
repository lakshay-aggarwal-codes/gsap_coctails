import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const useAuthGuard = (error) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error?.status === 401) {
            logout();
            navigate("/admin/login", { replace: true });
        }
    }, [error, logout, navigate]);
};

export default useAuthGuard;