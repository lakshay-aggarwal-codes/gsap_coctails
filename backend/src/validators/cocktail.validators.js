import {z} from "zod";

const cocktailQuerySchema = z.object({
    category: z.enum(["cocktail", "mocktail"]).optional(),
    search: z.string().trim().min(1, "search cannot be empty").max(100).optional(),
    page: z.coerce.number().int().min(1, "page must be at least 1").optional(),
    limit: z.coerce
        .number()
        .int()
        .min(1, "limit must be at least 1")
        .max(100, "limit cannot exceed 100")
        .optional(),
});

const cocktailCreateSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    category: z.enum(["cocktail", "mocktail"]),
    tier: z.enum(["popular", "loved"]),
    country: z.string().trim().max(100).optional(),
    detail: z.string().trim().max(500).optional(),
    price: z.coerce.number().min(0).optional(),
    image: z.string().trim().url("Image must be a valid URL")
        .or(z.literal("")).optional(),
    title: z.string().trim().max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    isAvailable: z.boolean().optional(),
});

const cocktailUpdateSchema = cocktailCreateSchema.partial();

export {
    cocktailQuerySchema,
    cocktailCreateSchema,
    cocktailUpdateSchema,
};