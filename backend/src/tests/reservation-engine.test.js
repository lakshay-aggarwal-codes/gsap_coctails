import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Reservation from "../models/Reservation.js";
import Admin from "../models/Admin.js";
import RESERVATION_RULES from "../config/reservationRules.js";
import { connectTestDB, closeTestDB } from "./setup.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-reservation-engine-tests";

const futureDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
};

const validReservation = (overrides = {}) => ({
    name: "Test Guest",
    email: "guest@example.com",
    phone: "1234567890",
    date: futureDate(30),
    time: "18:00",
    numberOfGuests: 2,
    ...overrides,
});

let token;

beforeAll(async () => {
    await connectTestDB();
    await Admin.create({ username: "engineadmin", email: "engineadmin@example.com", password: "testpassword123" });
    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "engineadmin@example.com", password: "testpassword123" });
    token = loginRes.body.data.token;
});

afterAll(async () => { await closeTestDB(); });
beforeEach(async () => { await Reservation.deleteMany({}); });

describe("Reservation creation — time-slot validation", () => {
    it("accepts a valid, in-hours, slot-aligned booking", async () => {
        const res = await request(app).post("/api/reservations").send(validReservation());
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("pending");
    });

    it("rejects a time outside operating hours", async () => {
        const res = await request(app).post("/api/reservations").send(validReservation({ time: "10:00" }));
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/between/i);
    });

    it("rejects a time not aligned to the slot interval", async () => {
        const res = await request(app).post("/api/reservations").send(validReservation({ time: "18:15" }));
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/interval/i);
    });

    it("rejects a past date", async () => {
        const res = await request(app).post("/api/reservations").send(validReservation({ date: "2020-01-01" }));
        expect(res.status).toBe(400);
    });

    it("rejects a party larger than MAX_PARTY_SIZE", async () => {
        const res = await request(app)
            .post("/api/reservations")
            .send(validReservation({ numberOfGuests: RESERVATION_RULES.MAX_PARTY_SIZE + 1 }));
        expect(res.status).toBe(400);
    });
});

describe("Reservation creation — capacity/conflict detection", () => {
    it("fills a slot exactly to capacity across multiple bookings, then rejects the next one", async () => {
        const date = futureDate(31);
        const time = "19:00";
        const full = RESERVATION_RULES.MAX_GUESTS_PER_SLOT;

        const first = await request(app).post("/api/reservations").send(validReservation({ date, time, numberOfGuests: full - 2 }));
        expect(first.status).toBe(201);

        const second = await request(app).post("/api/reservations").send(validReservation({ date, time, numberOfGuests: 2 }));
        expect(second.status).toBe(201);

        const third = await request(app).post("/api/reservations").send(validReservation({ date, time, numberOfGuests: 1 }));
        expect(third.status).toBe(409);
        expect(third.body.message).toMatch(/fully booked/i);
    });

    it("does not count a cancelled reservation toward capacity", async () => {
        const date = futureDate(32);
        const time = "20:00";

        const cancelled = await Reservation.create({
            ...validReservation({ date, time, numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }),
            status: "cancelled",
        });
        expect(cancelled.status).toBe("cancelled");

        const res = await request(app).post("/api/reservations").send(validReservation({ date, time, numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }));
        expect(res.status).toBe(201);
    });

    it("a different time slot on the same date is unaffected by a full slot", async () => {
        const date = futureDate(33);
        await request(app).post("/api/reservations").send(validReservation({ date, time: "18:00", numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }));
        const res = await request(app).post("/api/reservations").send(validReservation({ date, time: "18:30", numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }));
        expect(res.status).toBe(201);
    });
});

describe("Reservation update (PUT) — re-validation on rebooking", () => {
    it("excludes the reservation being edited from its own capacity check", async () => {
        const date = futureDate(34);
        const time = "21:00";
        const createRes = await request(app).post("/api/reservations").send(validReservation({ date, time, numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }));
        const id = createRes.body.data._id;

        const updateRes = await request(app)
            .put(`/api/reservations/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT - 5 });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.data.numberOfGuests).toBe(RESERVATION_RULES.MAX_GUESTS_PER_SLOT - 5);
    });

    it("rejects rebooking into a slot that is genuinely full elsewhere", async () => {
        const date = futureDate(35);
        await request(app).post("/api/reservations").send(validReservation({ date, time: "18:00", numberOfGuests: RESERVATION_RULES.MAX_GUESTS_PER_SLOT }));
        const otherRes = await request(app).post("/api/reservations").send(validReservation({ date, time: "19:00", numberOfGuests: 2 }));
        const otherId = otherRes.body.data._id;

        const updateRes = await request(app)
            .put(`/api/reservations/${otherId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ time: "18:00" });

        expect(updateRes.status).toBe(409);
    });

    it("a pure status update does not re-run slot/capacity validation", async () => {
        const date = futureDate(36);
        const createRes = await request(app).post("/api/reservations").send(validReservation({ date, time: "18:00", numberOfGuests: 2 }));
        const id = createRes.body.data._id;

        const updateRes = await request(app)
            .put(`/api/reservations/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "confirmed" });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.data.status).toBe("confirmed");
    });
});


describe("customer linking via optionalCustomerAuth", () => {
    let customerToken;

    beforeAll(async () => {
        const Customer = (await import("../models/Customer.js")).default;
        await Customer.deleteMany({ email: "linktest@example.com" });
        const res = await request(app).post("/api/customers/register").send({
            name: "Link Test",
            email: "linktest@example.com",
            password: "password123",
            confirmPassword: "password123",
        });
        customerToken = res.body.data.token;
    });

    it("attaches the customer when a valid customer token is present", async () => {
        const res = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${customerToken}`)
            .send(validReservation({ date: futureDate(40) }));

        expect(res.status).toBe(201);
        expect(res.body.data.customer).toBeTruthy();
    });

    it("leaves customer null for a guest booking with no token", async () => {
        const res = await request(app).post("/api/reservations").send(validReservation({ date: futureDate(41) }));

        expect(res.status).toBe(201);
        expect(res.body.data.customer).toBeFalsy();
    });

    it("does not reject the booking if an invalid/expired token is supplied", async () => {
        const res = await request(app)
            .post("/api/reservations")
            .set("Authorization", "Bearer not-a-real-token")
            .send(validReservation({ date: futureDate(42) }));

        expect(res.status).toBe(201);
        expect(res.body.data.customer).toBeFalsy();
    });

    it("GET /reservations/mine returns only that customer's own reservations", async () => {
        await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${customerToken}`)
            .send(validReservation({ date: futureDate(43) }));

          await request(app).post("/api/reservations").send(validReservation({ date: futureDate(44) }));

        const res = await request(app).get("/api/reservations/mine").set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.every((r) => r.customer)).toBe(true);
    });
});