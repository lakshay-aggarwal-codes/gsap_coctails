import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env.PORT || 5000;

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Velvet Pour API",
            version: "1.0.0",
            description:
                "REST API for the Velvet Pour cocktail bar - public storefront endpoints " +
                "(menu, reservations, contact) plus an admin-only surface (auth, cocktail " +
                "management, reservation/contact moderation, dashboard analytics).",
        },

        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: "Local development",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Obtain a token via POST /auth/login, then send it as " +
                        "'Authorization: Bearer <token>' on protected routes.",
                },
            },

            schemas: {
                Cocktail: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        category: {
                            type: "string",
                            enum: ["cocktail", "mocktail"],
                        },
                        tier: {
                            type: "string",
                            enum: ["popular", "loved"],
                        },
                        country: { type: "string" },
                        detail: { type: "string" },
                        price: { type: "number" },
                        image: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        isAvailable: { type: "boolean" },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                Reservation: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: {
                            type: "string",
                            format: "email",
                        },
                        phone: { type: "string" },
                        date: {
                            type: "string",
                            example: "2026-09-14",
                            description: "YYYY-MM-DD",
                        },
                        time: {
                            type: "string",
                            example: "19:30",
                            description: "24-hour HH:mm",
                        },
                        numberOfGuests: {
                            type: "integer",
                            minimum: 1,
                        },
                        specialRequest: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["pending", "confirmed", "cancelled"],
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                Contact: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: {
                            type: "string",
                            format: "email",
                        },
                        message: { type: "string" },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                        },
                    },
                },
            },
        },
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;