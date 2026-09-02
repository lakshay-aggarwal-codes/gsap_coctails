import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/api.js";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useCustomerAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const data = await resetPassword({ resetToken: token, password, confirmPassword });
            login(data);
            navigate("/account", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-dvh w-full flex-center radial-gradient px-5 overflow-hidden">
            <div className="noisy" />

            <div className="relative z-10 w-full max-w-md py-20">
                <p className="font-modern-negra text-5xl text-center text-yellow mb-2">
                    Velvet Pour
                </p>
                <h1 className="font-serif text-3xl text-center text-white-100 mb-10">
                    Choose a New Password
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password"
                            aria-label="New password"
                            autoComplete="new-password"
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pr-16 text-white placeholder-white/40 focus:outline-none focus:border-yellow"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white-100/60 hover:text-yellow"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            aria-label="Confirm new password"
                            autoComplete="new-password"
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pr-16 text-white placeholder-white/40 focus:outline-none focus:border-yellow"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white-100/60 hover:text-yellow"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-yellow text-black font-semibold px-6 py-3 hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isSubmitting ? "Updating..." : "Update Password"}
                    </button>
                </form>

                <p className="text-center text-sm text-white-100/60 mt-6">
                    <Link to="/account/login" className="text-yellow hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default ResetPassword;
