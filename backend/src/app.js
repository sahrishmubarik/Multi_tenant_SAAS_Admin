import express from "express";
import cors from "cors";
import router from "#routes/index.js";
import { errorHandler } from "#middlewares/errorHandler.js";

const app = express();

// Allowed origins come from CORS_ORIGINS (comma-separated) and fall back to the local dev client.
const corsOrigins = process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || [
  "http://localhost:5173",
];

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.use("/api/v1/", router);

// Central error handler — must be registered last.
app.use(errorHandler);

export default app;
