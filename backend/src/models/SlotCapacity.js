import mongoose from "mongoose";

const slotCapacitySchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    bookedGuests: { type: Number, required: true, default: 0 },
});

slotCapacitySchema.index({ date: 1, time: 1 }, { unique: true });

const SlotCapacity = mongoose.model("SlotCapacity", slotCapacitySchema);

export default SlotCapacity;