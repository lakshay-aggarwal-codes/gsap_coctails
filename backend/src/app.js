import express from "express";
import cors from "cors";
import helmet from "helmet";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import favoriteRoutes from "./routes/favorite.routes.js";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);
app.use(express.json({ limit: "10kb" }));
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use(
    "/api/docs",
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "'unsafe-inline'"],
                "style-src": ["'self'", "'unsafe-inline'"],
            },
        },
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use(notFound);
app.use(errorHandler);
export default app;
