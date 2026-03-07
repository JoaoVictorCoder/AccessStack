import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createCredenciadoHandler,
  getCredenciadoByIdHandler,
  listCredenciadoEventosHandler,
  listCredenciadosHandler
} from "../controllers/credenciadoController.js";
import { getCredencialByIdHandler } from "../controllers/credencialController.js";
import { listEventosSistemaHandler } from "../controllers/eventoSistemaController.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/credenciados", asyncHandler(createCredenciadoHandler));
router.get("/credenciados", asyncHandler(listCredenciadosHandler));
router.get("/credenciados/:id", asyncHandler(getCredenciadoByIdHandler));
router.get(
  "/credenciados/:id/eventos",
  asyncHandler(listCredenciadoEventosHandler)
);

router.get("/credenciais/:id", asyncHandler(getCredencialByIdHandler));
router.get("/eventos", asyncHandler(listEventosSistemaHandler));
