import Contact from "../models/Contact.js";
import {buildPaginationMeta} from "../utils/pagination.js";
import asyncHandler from "../utils/asyncHandler.js";
 
const createContactMessage = asyncHandler(async (req, res) => {
    const message = await Contact.create(req.body);

    res.status(201).json({
        success: true,
        data: message,
    });
});

const getContactMessages = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Contact.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        data: messages,
        pagination: buildPaginationMeta({ page, limit, total }),
    });
});
 
const getContactMessageById = asyncHandler(async (req, res) => {
    const message = await Contact.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }

    res.status(200).json({
        success: true,
        data: message,
    });
});
 
const deleteContactMessage = asyncHandler(async (req, res) => {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }

    res.status(200).json({
        success: true,
        data: {},
    });
});

export {
    createContactMessage,
    getContactMessages,
    getContactMessageById,
    deleteContactMessage,
};
