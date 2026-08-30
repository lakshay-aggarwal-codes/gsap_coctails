import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import asyncHandler from "../utils/asyncHandler.js";

const protectCustomer = asyncHandler(async (req, res, next) => {
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
        throw new Error("Not authorized, invalid or expired token");
    }

    if (decoded.role !== "customer") {
        res.status(401);
        throw new Error("Not authorized, customer access required");
    }

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
        res.status(401);
        throw new Error("Not authorized, account no longer exists");
    }

    req.customer = customer;
    next();
});

export default protectCustomer;