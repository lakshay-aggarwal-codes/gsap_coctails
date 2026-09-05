import { createContext, useContext, useState, useCallback } from "react";
import { CUSTOMER_AUTH_STORAGE_KEY } from "../constants/customerAuth.js";

const CustomerAuthContext = createContext(null);

const readStoredAuth = () => {
    try {
        const raw = localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const CustomerAuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(readStoredAuth);

    const login = useCallback((authData) => {
        localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify(authData));
        setAuth(authData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
        setAuth(null);
    }, []);

    const value = {
        customer: auth,
        token: auth?.token ?? null,
        isAuthenticated: Boolean(auth?.token),
        login,
        logout,
    };

    return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext);
    if (!context) {
        throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
    }
    return context;
};