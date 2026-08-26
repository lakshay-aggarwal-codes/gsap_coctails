import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
 

describe("Health check", () => {
    it("GET /api/health returns success", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("Unknown routes", () => {
    it("returns 404 for an undefined route", async () => {
        const res = await request(app).get("/api/does-not-exist");
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("Auth guard on protected routes (Task 1 regression check)", () => {
    it("rejects POST /api/cocktails with no token", async () => {
        const res = await request(app).post("/api/cocktails").send({ name: "Test" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("rejects GET /api/reservations with no token", async () => {
        const res = await request(app).get("/api/reservations");
        expect(res.status).toBe(401);
    });

    it("rejects GET /api/contact with no token", async () => {
        const res = await request(app).get("/api/contact");
        expect(res.status).toBe(401);
    });

    it("rejects a malformed Authorization header", async () => {
        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", "Token not-a-bearer-token")
            .send({ name: "Test" });
        expect(res.status).toBe(401);
    });
});

describe("Login input validation", () => {
    it("rejects login with missing email/password before touching the database", async () => {
        const res = await request(app).post("/api/auth/login").send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});