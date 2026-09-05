import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401);
        throw new Error("Not authorized, no token provided");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, invalid or expired token", { cause: error });
    }

    if (decoded.role !== "admin") {
        res.status(401);
        throw new Error("Not authorized, admin access required");
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
        res.status(401);
        throw new Error("Not authorized, admin no longer exists");
    }

    req.admin = admin;
    next();
});

export default protect;