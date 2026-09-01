import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-customer-auth-tests";

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Customer.deleteMany({});
    await Admin.deleteMany({});
});

const validRegistration = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
};

describe("POST /api/customers/register", () => {
    it("creates an account with a valid payload and returns a token", async () => {
        const res = await request(app).post("/api/customers/register").send(validRegistration);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(validRegistration.email);
        expect(typeof res.body.data.token).toBe("string");
    });

    it("rejects mismatched passwords", async () => {
        const res = await request(app)
            .post("/api/customers/register")
            .send({ ...validRegistration, confirmPassword: "somethingElse123" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e) => e.field === "confirmPassword")).toBe(true);
    });

    it("rejects a password under 8 characters", async () => {
        const res = await request(app)
            .post("/api/customers/register")
            .send({ ...validRegistration, password: "short", confirmPassword: "short" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e) => e.field === "password")).toBe(true);
    });

    it("rejects a duplicate email", async () => {
        await request(app).post("/api/customers/register").send(validRegistration);

        const res = await request(app).post("/api/customers/register").send(validRegistration);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/customers/login", () => {
    beforeEach(async () => {
        await request(app).post("/api/customers/register").send(validRegistration);
    });

    it("logs in with correct credentials", async () => {
        const res = await request(app)
            .post("/api/customers/login")
            .send({ email: validRegistration.email, password: validRegistration.password });

        expect(res.status).toBe(200);
        expect(typeof res.body.data.token).toBe("string");
    });

    it("rejects an incorrect password", async () => {
        const res = await request(app)
            .post("/api/customers/login")
            .send({ email: validRegistration.email, password: "wrongPassword123" });

        expect(res.status).toBe(401);
    });
});

describe("GET/PUT /api/customers/me", () => {
    let token;

    beforeEach(async () => {
        const res = await request(app).post("/api/customers/register").send(validRegistration);
        token = res.body.data.token;
    });

    it("rejects with no token", async () => {
        const res = await request(app).get("/api/customers/me");
        expect(res.status).toBe(401);
    });

    it("returns the logged-in customer's own profile", async () => {
        const res = await request(app).get("/api/customers/me").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(validRegistration.email);
    });

    it("updates the name", async () => {
        const res = await request(app)
            .put("/api/customers/me")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Jane Updated" });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Jane Updated");
    });
});

describe("role separation between admin and customer auth", () => {
    it("rejects an admin token on a customer-protected route", async () => {
        await Admin.create({
            username: "roleadmin",
            email: "roleadmin@example.com",
            password: "testpassword123",
        });
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "roleadmin@example.com", password: "testpassword123" });

        const res = await request(app)
            .get("/api/customers/me")
            .set("Authorization", `Bearer ${adminLogin.body.data.token}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/customer access required/i);
    });

    it("rejects a customer token on an admin-protected route", async () => {
        const customerRegister = await request(app).post("/api/customers/register").send(validRegistration);

        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", `Bearer ${customerRegister.body.data.token}`)
            .send({ name: "Test", category: "cocktail", tier: "popular" });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/admin access required/i);
    });
});