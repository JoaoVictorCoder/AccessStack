import cors from "cors";
import express from "express";
import { prisma } from "./prisma.js";
import { validateCredenciadoPayload } from "./validation.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/credenciados", async (req, res) => {
  const result = validateCredenciadoPayload(req.body || {});
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  try {
    const created = await prisma.credenciado.create({ data: result.data });
    return res.status(201).json(created);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "cpf ou email ja cadastrado" });
    }
    return res.status(500).json({ error: "erro ao salvar credenciado" });
  }
});

app.get("/credenciados", async (_req, res) => {
  const items = await prisma.credenciado.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(items);
});

app.get("/credenciados/:id", async (req, res) => {
  const item = await prisma.credenciado.findUnique({
    where: { id: req.params.id }
  });

  if (!item) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }
  return res.json(item);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "erro interno" });
});
