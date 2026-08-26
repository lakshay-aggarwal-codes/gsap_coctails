import { z } from "zod";
 
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

export { cocktailQuerySchema };