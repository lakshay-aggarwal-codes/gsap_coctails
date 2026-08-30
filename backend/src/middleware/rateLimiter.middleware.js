import rateLimit from "express-rate-limit";

const formSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: {
        success: false,
        message: "Too many submissions from this IP, please try again later.",
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts from this IP, please try again later.",
    },
});

export default formSubmissionLimiter;
export { loginLimiter };