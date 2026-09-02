import Customer from "../models/Customer.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { createToken, hashToken } from "../utils/tokens.js";
import sendMail from "../utils/mailer.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1h
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const sendVerificationEmail = async (customer) => {
    const { rawToken, tokenHash } = createToken();

    customer.emailVerificationTokenHash = tokenHash;
    customer.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    await customer.save({ validateBeforeSave: false });

    const verifyUrl = `${CLIENT_URL}/account/verify-email/${rawToken}`;

    await sendMail({
        to: customer.email,
        subject: "Verify your Velvet Pour email",
        text: `Welcome to Velvet Pour, ${customer.name}. Verify your email: ${verifyUrl} (expires in 24 hours)`,
        html: `<p>Welcome to Velvet Pour, ${customer.name}.</p><p><a href="${verifyUrl}">Verify your email</a> (expires in 24 hours)</p>`,
    });
};

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
        res.status(409);
        throw new Error("An account with this email already exists");
    }

    const customer = await Customer.create({ name, email, password });
    await sendVerificationEmail(customer);

    res.status(201).json({
        success: true,
        data: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            isEmailVerified: customer.isEmailVerified,
            token: generateToken(customer._id, "customer"),
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer || !(await customer.matchPassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    res.status(200).json({
        success: true,
        data: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            isEmailVerified: customer.isEmailVerified,
            token: generateToken(customer._id, "customer"),
        },
    });
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            id: req.customer._id,
            name: req.customer.name,
            email: req.customer.email,
            isEmailVerified: req.customer.isEmailVerified,
            createdAt: req.customer.createdAt,
        },
    });
});

const updateMe = asyncHandler(async (req, res) => {
    req.customer.name = req.body.name;
    await req.customer.save();

    res.status(200).json({
        success: true,
        data: {
            id: req.customer._id,
            name: req.customer.name,
            email: req.customer.email,
            isEmailVerified: req.customer.isEmailVerified,
        },
    });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const tokenHash = hashToken(req.params.token);

    const customer = await Customer.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!customer) {
        res.status(400);
        throw new Error("This verification link is invalid or has expired");
    }

    customer.isEmailVerified = true;
    customer.emailVerificationTokenHash = undefined;
    customer.emailVerificationExpires = undefined;
    await customer.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Email verified",
    });
});

const resendVerification = asyncHandler(async (req, res) => {
    if (req.customer.isEmailVerified) {
        res.status(200).json({
            success: true,
            message: "Your email is already verified",
        });
        return;
    }

    await sendVerificationEmail(req.customer);

    res.status(200).json({
        success: true,
        message: "Verification email sent",
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer) {
        res.status(404);
        throw new Error("No account found with that email address");
    }

    const { rawToken, tokenHash } = createToken();
    customer.passwordResetTokenHash = tokenHash;
    customer.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await customer.save({ validateBeforeSave: false });

    const resetUrl = `${CLIENT_URL}/account/reset-password/${rawToken}`;

    await sendMail({
        to: customer.email,
        subject: "Reset your Velvet Pour password",
        text: `Reset your password: ${resetUrl} (expires in 1 hour). If you didn't request this, ignore this email.`,
        html: `<p><a href="${resetUrl}">Reset your password</a> (expires in 1 hour).</p><p>If you didn't request this, ignore this email.</p>`,
    });

    res.status(200).json({
        success: true,
        message: "Reset link sent",
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const tokenHash = hashToken(req.params.token);

    const customer = await Customer.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");

    if (!customer) {
        res.status(400);
        throw new Error("This reset link is invalid or has expired");
    }

    customer.password = req.body.password;
    customer.passwordResetTokenHash = undefined;
    customer.passwordResetExpires = undefined;
    await customer.save();

    res.status(200).json({
        success: true,
        message: "Password updated",
        data: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            isEmailVerified: customer.isEmailVerified,
            token: generateToken(customer._id, "customer"),
        },
    });
});

export {
    register,
    login,
    getMe,
    updateMe,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
};
