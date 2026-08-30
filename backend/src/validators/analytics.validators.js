import { z } from "zod";

const trendQuerySchema = z.object({
    days: z.coerce
        .number()
        .int()
        .min(1, "days must be at least 1")
        .max(90, "days cannot exceed 90")
        .default(30),
});

export { trendQuerySchema };