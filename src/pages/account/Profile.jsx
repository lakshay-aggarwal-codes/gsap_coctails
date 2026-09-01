import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyProfile, updateMyProfile, resendVerificationEmail } from "../../services/api.js";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import useCustomerAuthGuard from "../../hooks/useCustomerAuthGuard.js";

const Profile = () => {
    const { token } = useCustomerAuth();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [saved, setSaved] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    const profileQuery = useQuery({
        queryKey: ["customer", "profile"],
        queryFn: () => fetchMyProfile({ token }),
    });

    useCustomerAuthGuard(profileQuery.error);

    useEffect(() => {
        if (profileQuery.data) {
            setName(profileQuery.data.name);
        }
    }, [profileQuery.data]);

    const updateMutation = useMutation({
        mutationFn: () => updateMyProfile({ token, name }),
        onSuccess: (data) => {
            queryClient.setQueryData(["customer", "profile"], data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
    });

    const resendMutation = useMutation({
        mutationFn: () => resendVerificationEmail({ token }),
        onSuccess: () => setResendSent(true),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    if (profileQuery.isLoading) {
        return <p className="text-white-100/60">Loading...</p>;
    }

    if (profileQuery.error) {
        return (
            <div className="max-w-md">
                <p className="text-red-400 mb-4">Something went wrong loading your profile.</p>
                <button
                    onClick={() => profileQuery.refetch()}
                    className="rounded-full border border-white-100/20 px-4 py-2 text-sm hover:border-yellow hover:text-yellow transition-colors"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md">
            <h1 className="font-serif text-3xl mb-8">Profile</h1>

            {profileQuery.data && !profileQuery.data.isEmailVerified && (
                <div className="mb-6 rounded-lg border border-yellow/30 bg-yellow/10 px-4 py-3 text-sm">
                    <p className="text-yellow">Your email address isn't verified yet.</p>
                    {resendSent ? (
                        <p className="text-white-100/60 mt-1">Verification email sent — check your inbox.</p>
                    ) : (
                        <button
                            onClick={() => resendMutation.mutate()}
                            disabled={resendMutation.isPending}
                            className="mt-1 text-yellow underline hover:opacity-80 disabled:opacity-50"
                        >
                            {resendMutation.isPending ? "Sending..." : "Resend verification email"}
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-white-100/60 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow"
                    />
                </div>

                <div>
                    <label className="block text-sm text-white-100/60 mb-1">Email</label>
                    <input
                        type="email"
                        value={profileQuery.data?.email ?? ""}
                        disabled
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white-100/50"
                    />
                </div>

                {updateMutation.error && (
                    <p role="alert" className="text-sm text-red-400">
                        {updateMutation.error.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-full bg-yellow text-black font-semibold px-6 py-3 hover:opacity-90 transition disabled:opacity-50"
                >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>

                {saved && <span className="ml-4 text-sm text-green-400">Saved</span>}
            </form>
        </div>
    );
};

export default Profile;