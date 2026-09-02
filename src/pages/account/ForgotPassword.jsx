import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/api.js";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await forgotPassword({ email });
            setSent(true);
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
                    Reset Your Password
                </h1>

                {sent ? (
                    <p className="text-center text-white-100/70">
                          A reset link is on its way. It'll expire in 1 hour.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            aria-label="Email"
                            autoComplete="username"
                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow"
                        />

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
                            {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-white-100/60 mt-6">
                    <Link to="/account/login" className="text-yellow hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default ForgotPassword;
