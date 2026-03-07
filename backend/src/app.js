import cors from "cors";
import express from "express";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use(router);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "erro interno" });
});
