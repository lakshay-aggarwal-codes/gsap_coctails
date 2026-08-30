import mongoose from "mongoose";
 
const reservationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        date: {
            type: String, 
            required: [true, "Reservation date is required"],
        },
        time: {
            type: String, 
            required: [true, "Reservation time is required"],
        },
        numberOfGuests: {
            type: Number,
            required: [true, "Number of guests is required"],
            min: [1, "Must have at least 1 guest"],
        },
        specialRequest: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
            customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
        },
    },
    { timestamps: true }
);
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ customer: 1, date: -1 });
const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
