import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const useCustomerAuthGuard = (error) => {
    const { logout } = useCustomerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error?.status === 401) {
            logout();
            navigate("/account/login", { replace: true });
        }
    }, [error, logout, navigate]);
};

export default useCustomerAuthGuard;
