import { createContext, useContext, useState, useCallback } from "react";
import { AUTH_STORAGE_KEY } from "../constants/auth.js";

const AuthContext = createContext(null);

const readStoredAuth = () => {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(readStoredAuth);

    const login = useCallback((authData) => {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setAuth(authData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuth(null);
    }, []);

    const value = {
        admin: auth,
        token: auth?.token ?? null,
        isAuthenticated: Boolean(auth?.token),
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};