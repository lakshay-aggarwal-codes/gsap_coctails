import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../../services/api.js";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        verifyEmail({ verificationToken: token })
            .then(() => {
                if (isMounted) setStatus("success");
            })
            .catch((err) => {
                if (isMounted) {
                    setStatus("error");
                    setMessage(err.message);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [token]);

    return (
        <main className="relative min-h-dvh w-full flex-center radial-gradient px-5 overflow-hidden">
            <div className="noisy" />

            <div className="relative z-10 w-full max-w-md py-20 text-center">
                <p className="font-modern-negra text-5xl text-yellow mb-2">Velvet Pour</p>

                {status === "verifying" && (
                    <p className="text-white-100/70 mt-8">Verifying your email...</p>
                )}

                {status === "success" && (
                    <>
                        <h1 className="font-serif text-3xl text-white-100 mt-8 mb-4">Email Verified</h1>
                        <p className="text-white-100/70 mb-8">Your email address has been confirmed.</p>
                        <Link
                            to="/account"
                            className="inline-block rounded-full bg-yellow text-black font-semibold px-6 py-3 hover:opacity-90 transition"
                        >
                            Go to My Account
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="font-serif text-3xl text-white-100 mt-8 mb-4">Link Invalid or Expired</h1>
                        <p className="text-red-400 mb-8">{message}</p>
                        <Link to="/account" className="text-yellow hover:underline">
                            Go to My Account to resend it
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
};

export default VerifyEmail;
