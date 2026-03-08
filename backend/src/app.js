import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { requestContextMiddleware } from "./middlewares/requestContextMiddleware.js";
import { router } from "./routes/index.js";

export const app = express();

// CORS e cookies sustentam a autenticacao entre Vite e API local.
// Se o frontend mudar de dominio/porta, ajuste `CORS_ORIGINS` antes de depurar
// login quebrado; esse costuma ser o primeiro ponto de falha em ambiente manual.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(requestContextMiddleware);
app.use(cookieParser());
app.use(express.json());

app.use(router);

app.use(errorHandlerMiddleware);
