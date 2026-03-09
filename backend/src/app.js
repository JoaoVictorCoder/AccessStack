import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { requestContextMiddleware } from "./middlewares/requestContextMiddleware.js";
import { securityHeadersMiddleware } from "./middlewares/securityHeadersMiddleware.js";
import { router } from "./routes/index.js";

export const app = express();

// CORS e cookies sustentam a autenticacao entre Vite e API local.
// Se o frontend mudar de dominio/porta, ajuste `CORS_ORIGINS` antes de depurar
// login quebrado; esse costuma ser o primeiro ponto de falha em ambiente manual.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);
app.use(requestContextMiddleware);
app.use(securityHeadersMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "256kb" }));

app.use(router);

app.use(errorHandlerMiddleware);
