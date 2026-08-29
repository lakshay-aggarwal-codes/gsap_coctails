import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Cocktail from "../models/Cocktail.js";
import Reservation from "../models/Reservation.js";
import Contact from "../models/Contact.js";
import Admin from "../models/Admin.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-pagination-tests";

let token;

beforeAll(async () => {
    await connectTestDB();

    await Admin.create({
        username: "testadmin",
        email: "testadmin@example.com",
        password: "testpassword123",
    });

    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "testadmin@example.com", password: "testpassword123" });

    token = loginRes.body.data.token;
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Cocktail.deleteMany({});
    await Reservation.deleteMany({});
    await Contact.deleteMany({});
});

const seedCocktails = (count) =>
    Cocktail.insertMany(
        Array.from({ length: count }, (_, i) => ({
            name: `Cocktail ${i + 1}`,
            category: "cocktail",
            tier: "popular",
        }))
    );

const seedReservations = (count) =>
    Reservation.insertMany(
        Array.from({ length: count }, (_, i) => ({
            name: `Guest ${i + 1}`,
            email: `guest${i + 1}@example.com`,
            phone: "1234567890",
            date: "2026-09-01",
            time: "19:00",
            numberOfGuests: 2,
        }))
    );

describe("Cocktail pagination (opt-in)", () => {
    it("returns the full catalog with no pagination metadata when page/limit are omitted", async () => {
        await seedCocktails(5);
        const res = await request(app).get("/api/cocktails");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5);
        expect(res.body.pagination).toBeUndefined();
    });

    it("paginates when page/limit are explicitly passed", async () => {
        await seedCocktails(5);
        const res = await request(app).get("/api/cocktails?page=1&limit=2");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination).toMatchObject({
            page: 1, limit: 2, total: 5, totalPages: 3, hasNextPage: true, hasPrevPage: false,
        });
    });

    it("returns an empty array for a page beyond the available data, with correct metadata", async () => {
        await seedCocktails(3);
        const res = await request(app).get("/api/cocktails?page=5&limit=2");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.pagination).toMatchObject({
            page: 5, limit: 2, total: 3, totalPages: 2, hasNextPage: false, hasPrevPage: true,
        });
    });

    it("rejects an invalid category", async () => {
        const res = await request(app).get("/api/cocktails?category=banana");
        expect(res.status).toBe(400);
    });

    it("rejects page below 1", async () => {
        const res = await request(app).get("/api/cocktails?page=0");
        expect(res.status).toBe(400);
    });

    it("rejects limit above 100", async () => {
        const res = await request(app).get("/api/cocktails?limit=101");
        expect(res.status).toBe(400);
    });
});

describe("Reservation pagination (mandatory, admin-only)", () => {
    it("defaults to page 1, limit 20 when no params are given", async () => {
        await seedReservations(3);
        const res = await request(app).get("/api/reservations").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.pagination).toMatchObject({ page: 1, limit: 20, total: 3, totalPages: 1 });
        expect(res.body.data).toHaveLength(3);
    });

    it("applies skip/limit correctly across pages", async () => {
        await seedReservations(5);
        const res = await request(app).get("/api/reservations?page=2&limit=2").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });

    it("returns an empty array for a page beyond the available data", async () => {
        await seedReservations(2);
        const res = await request(app).get("/api/reservations?page=10&limit=2").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.pagination.hasNextPage).toBe(false);
    });

    it("rejects limit of 0", async () => {
        const res = await request(app).get("/api/reservations?limit=0").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });
});

describe("Contact pagination (shares the same schema/pattern as Reservation)", () => {
    it("defaults correctly and paginates on request", async () => {
        await Contact.insertMany(
            Array.from({ length: 4 }, (_, i) => ({
                name: `Sender ${i + 1}`, email: `sender${i + 1}@example.com`, message: "hello",
            }))
        );

        const defaultRes = await request(app).get("/api/contact").set("Authorization", `Bearer ${token}`);
        expect(defaultRes.body.pagination).toMatchObject({ page: 1, limit: 20, total: 4 });

        const pagedRes = await request(app).get("/api/contact?page=1&limit=1").set("Authorization", `Bearer ${token}`);
        expect(pagedRes.body.data).toHaveLength(1);
        expect(pagedRes.body.pagination.totalPages).toBe(4);
    });
});