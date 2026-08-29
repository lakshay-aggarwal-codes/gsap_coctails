import { z } from "zod";
const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "page must be at least 1").default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, "limit must be at least 1")
        .max(100, "limit cannot exceed 100")
        .default(20),
});

export { paginationQuerySchema };