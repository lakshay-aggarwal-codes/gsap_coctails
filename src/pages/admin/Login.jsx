import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const data = await loginAdmin({ email, password });
            login(data);
            navigate("/admin", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-dvh w-full flex-center bg-black px-5">
            <div className="w-full max-w-sm">
                <p className="font-modern-negra text-4xl text-center text-yellow mb-1">Velvet Pour</p>
                <h1 className="font-serif text-2xl text-center text-white-100 mb-8">Admin Sign In</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm text-white-100/70">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-transparent border border-white-100/20 rounded-none px-3 py-2 text-white-100 focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm text-white-100/70">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-transparent border border-white-100/20 rounded-none px-3 py-2 text-white-100 focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-400">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 py-2 border border-yellow text-yellow hover:bg-yellow hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-yellow"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default Login;