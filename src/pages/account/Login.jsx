import {useState, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {SplitText} from "gsap/all";
import {loginCustomer} from "../../services/api.js";
import {useCustomerAuth} from "../../context/CustomerAuthContext.jsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useCustomerAuth();
    const navigate = useNavigate();
    const containerRef = useRef();

    useGSAP(
        () => {
            const split = new SplitText(".account-title", {type: "chars"});

            gsap.from(split.chars, {
                yPercent: 100,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out",
                stagger: 0.04,
            });

            gsap.from(".account-form", {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "expo.out",
                delay: 0.4,
            });

            gsap.from(".account-leaf", {
                opacity: 0,
                scale: 0.9,
                duration: 1.4,
                ease: "expo.out",
                delay: 0.1,
            });
        },
        {scope: containerRef}
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const data = await loginCustomer({email, password});
            login(data);
            navigate("/account", {replace: true});
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main
            ref={containerRef}
            className="relative min-h-dvh w-full flex-center radial-gradient px-5 overflow-hidden"
        >
            <div className="noisy"/>

            <img
                src="/images/cocktail-left-leaf.png"
                alt=""
                aria-hidden="true"
                className="account-leaf absolute bottom-0 left-0 z-0 w-28 sm:w-40 md:w-52 lg:w-64 pointer-events-none opacity-70"
            />
            <img
                src="/images/cocktail-right-leaf.png"
                alt=""
                aria-hidden="true"
                className="account-leaf absolute top-0 right-0 z-0 w-28 sm:w-40 md:w-52 lg:w-64 pointer-events-none opacity-70 hidden md:block"
            />

            <div className="relative z-10 w-full max-w-md py-20">
                <p className="font-modern-negra text-5xl text-center text-yellow mb-2">
                    Velvet Pour
                </p>
                <h1 className="account-title font-serif text-3xl text-center text-white-100 mb-10 overflow-hidden">
                    Welcome Back
                </h1>

                <form onSubmit={handleSubmit} className="account-form space-y-4">
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
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            aria-label="Password"
                            autoComplete="current-password"
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
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-white-100/60 mt-6">
                    New here?{" "}
                    <Link to="/account/register" className="text-yellow hover:underline">
                        Create an account
                    </Link>
                </p>
                <p className="text-center text-sm mt-2">
                    <Link to="/account/forgot-password" className="text-white-100/60 hover:text-yellow hover:underline">
                        Forgot your password?
                    </Link>
                </p>

            </div>
        </main>
    );
};

export default Login;