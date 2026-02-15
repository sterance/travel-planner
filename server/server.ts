import "dotenv/config";
import "./db/migrate.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import tripsRouter from "./routes/trips.js";

const PORT = Number(process.env.PORT) || 3000;
const rawOrigins = process.env.CORS_ORIGINS ?? "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
  }),
);

app.use(healthRouter);
app.use(authRouter);
app.use(tripsRouter);

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
