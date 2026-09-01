import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Customer from "../models/Customer.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import { getTestMailbox, clearTestMailbox } from "../utils/mailer.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-verification-tests";

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Customer.deleteMany({});
    clearTestMailbox();
});

const validRegistration = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
};

const extractToken = (mail, path) => {
    const match = mail.text.match(new RegExp(`${path}/([a-f0-9]+)`));
    return match?.[1];
};

describe("email verification", () => {
    it("creates unverified customers and sends a verification email on register", async () => {
        const res = await request(app).post("/api/customers/register").send(validRegistration);

        expect(res.body.data.isEmailVerified).toBe(false);

        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        expect(mail).toBeDefined();
        expect(mail.subject).toMatch(/verify/i);
    });

    it("verifies the account with a valid token", async () => {
        await request(app).post("/api/customers/register").send(validRegistration);
        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        const token = extractToken(mail, "verify-email");

        const res = await request(app).get(`/api/customers/verify-email/${token}`);
        expect(res.status).toBe(200);

        const customer = await Customer.findOne({ email: validRegistration.email });
        expect(customer.isEmailVerified).toBe(true);
    });

    it("rejects an invalid verification token", async () => {
        const res = await request(app).get("/api/customers/verify-email/not-a-real-token");
        expect(res.status).toBe(400);
    });

    it("rejects an already-used verification token", async () => {
        await request(app).post("/api/customers/register").send(validRegistration);
        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        const token = extractToken(mail, "verify-email");

        await request(app).get(`/api/customers/verify-email/${token}`);
        const second = await request(app).get(`/api/customers/verify-email/${token}`);

        expect(second.status).toBe(400);
    });

    it("resends a verification email for a logged-in unverified customer", async () => {
        const register = await request(app).post("/api/customers/register").send(validRegistration);
        clearTestMailbox();

        const res = await request(app)
            .post("/api/customers/resend-verification")
            .set("Authorization", `Bearer ${register.body.data.token}`);

        expect(res.status).toBe(200);
        expect(getTestMailbox().some((m) => m.to === validRegistration.email)).toBe(true);
    });

    it("rejects resend-verification with no token", async () => {
        const res = await request(app).post("/api/customers/resend-verification");
        expect(res.status).toBe(401);
    });
});

describe("password reset", () => {
    beforeEach(async () => {
        await request(app).post("/api/customers/register").send(validRegistration);
        clearTestMailbox();
    });

    it("returns a generic success message for a known email", async () => {
        const res = await request(app)
            .post("/api/customers/forgot-password")
            .send({ email: validRegistration.email });

        expect(res.status).toBe(200);
        expect(getTestMailbox().some((m) => m.to === validRegistration.email)).toBe(true);
    });

    it("returns the same generic message for an unknown email, without sending mail", async () => {
        const res = await request(app)
            .post("/api/customers/forgot-password")
            .send({ email: "nobody@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/if an account exists/i);
        expect(getTestMailbox().length).toBe(0);
    });

    it("resets the password with a valid token and allows login with the new password", async () => {
        await request(app).post("/api/customers/forgot-password").send({ email: validRegistration.email });
        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        const token = extractToken(mail, "reset-password");

        const resetRes = await request(app)
            .post(`/api/customers/reset-password/${token}`)
            .send({ password: "newPassword456", confirmPassword: "newPassword456" });

        expect(resetRes.status).toBe(200);
        expect(typeof resetRes.body.data.token).toBe("string");

        const loginRes = await request(app)
            .post("/api/customers/login")
            .send({ email: validRegistration.email, password: "newPassword456" });
        expect(loginRes.status).toBe(200);

        const oldLoginRes = await request(app)
            .post("/api/customers/login")
            .send({ email: validRegistration.email, password: validRegistration.password });
        expect(oldLoginRes.status).toBe(401);
    });

    it("rejects reset with mismatched confirmPassword", async () => {
        await request(app).post("/api/customers/forgot-password").send({ email: validRegistration.email });
        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        const token = extractToken(mail, "reset-password");

        const res = await request(app)
            .post(`/api/customers/reset-password/${token}`)
            .send({ password: "newPassword456", confirmPassword: "somethingElse" });

        expect(res.status).toBe(400);
    });

    it("rejects an invalid or already-used reset token", async () => {
        await request(app).post("/api/customers/forgot-password").send({ email: validRegistration.email });
        const mail = getTestMailbox().find((m) => m.to === validRegistration.email);
        const token = extractToken(mail, "reset-password");

        await request(app)
            .post(`/api/customers/reset-password/${token}`)
            .send({ password: "newPassword456", confirmPassword: "newPassword456" });

        const secondAttempt = await request(app)
            .post(`/api/customers/reset-password/${token}`)
            .send({ password: "anotherPassword789", confirmPassword: "anotherPassword789" });

        expect(secondAttempt.status).toBe(400);
    });
});
