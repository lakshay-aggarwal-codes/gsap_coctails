import Customer from "../models/Customer.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
        res.status(409);
        throw new Error("An account with this email already exists");
    }

    const customer = await Customer.create({ name, email, password });

    res.status(201).json({
        success: true,
        data: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
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
        },
    });
});

export { register, login, getMe, updateMe };