import { z } from "zod";

const registerSchema = z
    .object({
        name: z.string().trim().min(1, "Name is required").max(100),
        email: z.string().trim().toLowerCase().email("Please provide a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters").max(72),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Please provide a valid email"),
    password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
});

const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Please provide a valid email"),
});

const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters").max(72),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};