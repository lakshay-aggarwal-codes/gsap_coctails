import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Cocktail from "../models/Cocktail.js";
import Customer from "../models/Customer.js";
import Favorite from "../models/Favorite.js";
import Admin from "../models/Admin.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-favorites-tests";

let customerToken;
let adminToken;

beforeAll(async () => {
    await connectTestDB();

    await Admin.create({
        username: "favadmin",
        email: "favadmin@example.com",
        password: "testpassword123",
    });
    const adminLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "favadmin@example.com", password: "testpassword123" });
    adminToken = adminLogin.body.data.token;

    const customerRegister = await request(app).post("/api/customers/register").send({
        name: "Fav Tester",
        email: "favtester@example.com",
        password: "password123",
        confirmPassword: "password123",
    });
    customerToken = customerRegister.body.data.token;
});

afterAll(async () => {
    await closeTestDB();
});

beforeEach(async () => {
    await Cocktail.deleteMany({});
    await Favorite.deleteMany({});
});

const createCocktail = (overrides = {}) =>
    Cocktail.create({ name: "Test Sazerac", category: "cocktail", tier: "popular", ...overrides });

describe("POST/DELETE /api/favorites/:cocktailId", () => {
    it("rejects with no token", async () => {
        const cocktail = await createCocktail();
        const res = await request(app).post(`/api/favorites/${cocktail._id}`);
        expect(res.status).toBe(401);
    });

    it("returns 404 for a nonexistent cocktail", async () => {
        const fakeId = "64b1f0c2e1b1c2a1e4f0a1b2";
        const res = await request(app)
            .post(`/api/favorites/${fakeId}`)
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.status).toBe(404);
    });

    it("likes a cocktail", async () => {
        const cocktail = await createCocktail();
        const res = await request(app)
            .post(`/api/favorites/${cocktail._id}`)
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.liked).toBe(true);
    });

    it("liking the same cocktail twice is idempotent, not an error", async () => {
        const cocktail = await createCocktail();

        const first = await request(app)
            .post(`/api/favorites/${cocktail._id}`)
            .set("Authorization", `Bearer ${customerToken}`);
        const second = await request(app)
            .post(`/api/favorites/${cocktail._id}`)
            .set("Authorization", `Bearer ${customerToken}`);

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);

        const count = await Favorite.countDocuments({ cocktail: cocktail._id });
        expect(count).toBe(1);
    });

    it("unliking is idempotent - unliking something never liked still succeeds", async () => {
        const cocktail = await createCocktail();
        const res = await request(app)
            .delete(`/api/favorites/${cocktail._id}`)
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.liked).toBe(false);
    });

    it("unlike actually removes the Favorite record", async () => {
        const cocktail = await createCocktail();
        await request(app).post(`/api/favorites/${cocktail._id}`).set("Authorization", `Bearer ${customerToken}`);
        await request(app).delete(`/api/favorites/${cocktail._id}`).set("Authorization", `Bearer ${customerToken}`);

        const count = await Favorite.countDocuments({ cocktail: cocktail._id });
        expect(count).toBe(0);
    });
});

describe("GET /api/customers/me/favorites", () => {
    it("returns the customer's liked cocktails", async () => {
        const cocktail = await createCocktail({ name: "Liked One" });
        await request(app).post(`/api/favorites/${cocktail._id}`).set("Authorization", `Bearer ${customerToken}`);

        const res = await request(app)
            .get("/api/customers/me/favorites")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe("Liked One");
    });

    it("drops a favorite whose cocktail was since deleted, rather than erroring", async () => {
        const cocktail = await createCocktail();
        await request(app).post(`/api/favorites/${cocktail._id}`).set("Authorization", `Bearer ${customerToken}`);
        await Cocktail.findByIdAndDelete(cocktail._id);

        const res = await request(app)
            .get("/api/customers/me/favorites")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

describe("GET /api/cocktails - isLikedByMe", () => {
    it("omits isLikedByMe entirely for anonymous requests", async () => {
        const cocktail = await createCocktail();
        await request(app).post(`/api/favorites/${cocktail._id}`).set("Authorization", `Bearer ${customerToken}`);

        const res = await request(app).get("/api/cocktails");
        expect(res.status).toBe(200);
        expect(res.body.data[0].isLikedByMe).toBeUndefined();
    });

    it("reflects the liked state for an authenticated customer", async () => {
        const liked = await createCocktail({ name: "Liked" });
        const notLiked = await createCocktail({ name: "Not liked" });
        await request(app).post(`/api/favorites/${liked._id}`).set("Authorization", `Bearer ${customerToken}`);

        const res = await request(app).get("/api/cocktails").set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        const likedResult = res.body.data.find((c) => c._id === String(liked._id));
        const notLikedResult = res.body.data.find((c) => c._id === String(notLiked._id));
        expect(likedResult.isLikedByMe).toBe(true);
        expect(notLikedResult.isLikedByMe).toBe(false);
    });
});

describe("GET /api/analytics/most-liked-cocktails", () => {
    it("rejects with no token", async () => {
        const res = await request(app).get("/api/analytics/most-liked-cocktails");
        expect(res.status).toBe(401);
    });

    it("ranks cocktails by like count, descending", async () => {
        const popular = await createCocktail({ name: "Popular One" });
        const lessPopular = await createCocktail({ name: "Less Popular" });

        const secondCustomer = await request(app).post("/api/customers/register").send({
            name: "Second Customer",
            email: "second@example.com",
            password: "password123",
            confirmPassword: "password123",
        });
        const secondToken = secondCustomer.body.data.token;

        await request(app).post(`/api/favorites/${popular._id}`).set("Authorization", `Bearer ${customerToken}`);
        await request(app).post(`/api/favorites/${popular._id}`).set("Authorization", `Bearer ${secondToken}`);
        await request(app).post(`/api/favorites/${lessPopular._id}`).set("Authorization", `Bearer ${customerToken}`);

        const res = await request(app)
            .get("/api/analytics/most-liked-cocktails")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe("Popular One");
        expect(res.body.data[0].likes).toBe(2);
        expect(res.body.data[1].name).toBe("Less Popular");
        expect(res.body.data[1].likes).toBe(1);
    });
});