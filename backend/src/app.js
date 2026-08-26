import express from "express";
import cors from "cors";
import helmet from "helmet";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);
app.use(express.json());
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;