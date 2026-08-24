import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";
 
const createContactMessage = asyncHandler(async (req, res) => {
    const message = await Contact.create(req.body);

    res.status(201).json({
        success: true,
        data: message,
    });
});
 
const getContactMessages = asyncHandler(async (req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
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
