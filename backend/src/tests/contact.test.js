import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";

import app from "../app.js";
import Contact from "../models/Contact.js";
import Admin from "../models/Admin.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET =
    process.env.JWT_SECRET || "test-secret-for-contact-tests";

let token;

const validContact = {
    name: "Test User",
    email: "test@example.com",
    message: "Hello, I would like more information about your cocktail bar.",
};

beforeAll(async () => {
    await connectTestDB();

    await Admin.deleteMany({});

    await Admin.create({
        username: "contactadmin",
        email: "contactadmin@example.com",
        password: "testpassword123",
    });

    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
            email: "contactadmin@example.com",
            password: "testpassword123",
        });

    token = loginRes.body.data.token;
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Contact.deleteMany({});
});

describe("Contact CRUD and validation", () => {
    it("POST /api/contact creates a contact message successfully", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send(validContact);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toBe(validContact.email);
    });

    it("POST /api/contact rejects missing required fields", async () => {
        /*
         * Contact currently relies on Mongoose validation rather than Zod.
         *
         * This verifies that a Mongoose ValidationError reaches the
         * centralized error handler correctly.
         */

        const res = await request(app)
            .post("/api/contact")
            .send({
                name: "Test User",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/contact rejects requests without authentication", async () => {
        const res = await request(app).get("/api/contact");

        expect(res.status).toBe(401);
    });

    it("GET /api/contact succeeds with an admin token", async () => {
        await Contact.create(validContact);

        const res = await request(app)
            .get("/api/contact")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
    });

    it("GET /api/contact/:id returns a single contact message", async () => {
        const contact = await Contact.create(validContact);

        const res = await request(app)
            .get(`/api/contact/${contact._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(contact._id.toString());
    });

    it("GET /api/contact/:id returns 404 for a malformed id", async () => {
        /*
         * A malformed ObjectId should trigger the CastError handling path.
         * It must return 404 instead of leaking into a 500 response.
         */

        const res = await request(app)
            .get("/api/contact/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/contact/:id returns 404 for a nonexistent id", async () => {
        const nonexistentId = "507f1f77bcf86cd799439011";

        const res = await request(app)
            .get(`/api/contact/${nonexistentId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("DELETE /api/contact/:id removes a contact message", async () => {
        const contact = await Contact.create(validContact);

        const deleteRes = await request(app)
            .delete(`/api/contact/${contact._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.status).toBe(200);

        const getRes = await request(app)
            .get(`/api/contact/${contact._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getRes.status).toBe(404);
    });
});