import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const createAdmin = async () => {
    const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error(
            "Missing required env vars. Usage:\n" +
            "  ADMIN_USERNAME=youradmin ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run create-admin"
        );
        process.exit(1);
    }

    if (ADMIN_PASSWORD.length < 8) {
        console.error("ADMIN_PASSWORD must be at least 8 characters.");
        process.exit(1);
    }

    try {
        await connectDB();

        const existing = await Admin.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.error(`An admin with email ${ADMIN_EMAIL} already exists.`);
            await mongoose.disconnect();
            process.exit(1);
        }
 
        const admin = await Admin.create({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });

        console.log(`Admin account created: ${admin.username} (${admin.email})`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Failed to create admin:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

createAdmin();
