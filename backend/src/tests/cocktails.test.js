import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";

import app from "../app.js";
import Cocktail from "../models/Cocktail.js";
import Admin from "../models/Admin.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET =
    process.env.JWT_SECRET || "test-secret-for-cocktail-tests";

let token;

const validCocktail = {
    name: "Test Mojito",
    category: "cocktail",
    tier: "popular",
    country: "Cuba",
    detail: "A refreshing mint and lime cocktail.",
    price: 12,
    image: "https://example.com/mojito.jpg",
    title: "Classic Mojito",
    description: "Fresh, minty and refreshing.",
    isAvailable: true,
};

beforeAll(async () => {
    await connectTestDB();

    await Admin.deleteMany({});

    await Admin.create({
        username: "cocktailadmin",
        email: "cocktailadmin@example.com",
        password: "testpassword123",
    });

    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
            email: "cocktailadmin@example.com",
            password: "testpassword123",
        });

    token = loginRes.body.data.token;
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Cocktail.deleteMany({});
});

describe("Cocktail CRUD and validation", () => {
    it("POST /api/cocktails rejects requests without a token", async () => {
        const res = await request(app)
            .post("/api/cocktails")
            .send(validCocktail);

        expect(res.status).toBe(401);
    });

    it("POST /api/cocktails rejects missing category and tier", async () => {
        const invalidCocktail = {
            ...validCocktail,
        };

        delete invalidCocktail.category;
        delete invalidCocktail.tier;

        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", `Bearer ${token}`)
            .send(invalidCocktail);

        expect(res.status).toBe(400);

        expect(res.body.errors).toBeDefined();

        const fields = res.body.errors.map(
            (error) => error.field || error.path
        );

        expect(fields).toContain("category");
        expect(fields).toContain("tier");
    });

    it("POST /api/cocktails rejects an invalid category", async () => {
        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ...validCocktail,
                category: "banana",
            });

        expect(res.status).toBe(400);
    });

    it("POST /api/cocktails rejects a non-URL image", async () => {
        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ...validCocktail,
                image: "not-a-valid-url",
            });

        expect(res.status).toBe(400);
    });

    it("POST /api/cocktails creates a cocktail successfully", async () => {
        const res = await request(app)
            .post("/api/cocktails")
            .set("Authorization", `Bearer ${token}`)
            .send(validCocktail);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe(validCocktail.name);
        expect(res.body.data.category).toBe("cocktail");
    });

    it("PUT /api/cocktails/:id allows a partial update", async () => {
        const cocktail = await Cocktail.create(validCocktail);

        const res = await request(app)
            .put(`/api/cocktails/${cocktail._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                price: 20,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.price).toBe(20);
    });

    it("PUT /api/cocktails/:id rejects an invalid tier", async () => {
        const cocktail = await Cocktail.create(validCocktail);

        const res = await request(app)
            .put(`/api/cocktails/${cocktail._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                tier: "invalid-tier",
            });

        expect(res.status).toBe(400);
    });

    it("PUT /api/cocktails/:id returns 404 for a nonexistent id", async () => {
        const nonexistentId = "507f1f77bcf86cd799439011";

        const res = await request(app)
            .put(`/api/cocktails/${nonexistentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                price: 25,
            });

        expect(res.status).toBe(404);
    });

    it("DELETE /api/cocktails/:id removes the cocktail", async () => {
        const cocktail = await Cocktail.create(validCocktail);

        const deleteRes = await request(app)
            .delete(`/api/cocktails/${cocktail._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.status).toBe(200);

        const getRes = await request(app)
            .get(`/api/cocktails/${cocktail._id}`);

        expect(getRes.status).toBe(404);
    });

    it("GET /api/cocktails works without authentication", async () => {
        await Cocktail.create(validCocktail);

        const res = await request(app).get("/api/cocktails");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
    });
});