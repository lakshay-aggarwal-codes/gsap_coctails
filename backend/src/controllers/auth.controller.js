import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.matchPassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            token: generateToken(admin._id, "admin"),
        },
    });
});

export { login };