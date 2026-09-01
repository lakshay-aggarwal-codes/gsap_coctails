import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Reservation from "../models/Reservation.js";
import Customer from "../models/Customer.js";

const backfillReservationCustomers = async () => {
    try {
        await connectDB();

        const orphaned = await Reservation.find({
            $or: [{ customer: null }, { customer: { $exists: false } }],
        });

        console.log(`Found ${orphaned.length} reservation(s) with no linked customer.`);

        let linked = 0;
        let unmatched = 0;

        for (const reservation of orphaned) {
            const customer = await Customer.findOne({ email: reservation.email });

            if (customer) {
                reservation.customer = customer._id;
                await reservation.save();
                linked += 1;
                console.log(`  Linked reservation ${reservation._id} (${reservation.email}) -> customer ${customer._id}`);
            } else {
                unmatched += 1;
            }
        }

        console.log(`\nDone. Linked ${linked} reservation(s). ${unmatched} remain unmatched (no account with that email).`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Backfill failed:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

backfillReservationCustomers();
