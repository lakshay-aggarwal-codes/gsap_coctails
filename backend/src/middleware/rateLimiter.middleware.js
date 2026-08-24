import rateLimit from "express-rate-limit";
 
const formSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  
    max: 10, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many submissions from this IP, please try again later.",
    },
});

export default formSubmissionLimiter;
