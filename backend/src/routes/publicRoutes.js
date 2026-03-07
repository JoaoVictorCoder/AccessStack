import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createCredenciadoPublicHandler,
  getCredenciadoPublicStatusHandler
} from "../controllers/credenciadoController.js";
import {
  getCredencialPublicPdfHandler,
  getCredencialPublicQrHandler
} from "../controllers/credencialController.js";

export const publicRouter = Router();

publicRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

publicRouter.post("/credenciados", asyncHandler(createCredenciadoPublicHandler));
publicRouter.get(
  "/credenciados/:id/status",
  asyncHandler(getCredenciadoPublicStatusHandler)
);
publicRouter.get("/credenciais/:id/pdf", asyncHandler(getCredencialPublicPdfHandler));
publicRouter.get("/credenciais/:id/qrcode", asyncHandler(getCredencialPublicQrHandler));
