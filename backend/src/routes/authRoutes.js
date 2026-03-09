import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  loginAdminHandler,
  logoutAdminHandler,
  meAdminHandler
} from "../controllers/adminAuthController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { createAuthLoginRateLimiter } from "../middlewares/rateLimitMiddleware.js";

export const authRouter = Router();
const authLoginRateLimiter = createAuthLoginRateLimiter();

authRouter.post("/login", authLoginRateLimiter, asyncHandler(loginAdminHandler));
authRouter.post("/operator/login", authLoginRateLimiter, asyncHandler(loginAdminHandler));
authRouter.post("/logout", asyncHandler(logoutAdminHandler));
authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(meAdminHandler));
authRouter.get("/operator/me", asyncHandler(requireAuth), asyncHandler(meAdminHandler));

// compatibilidade com rotas antigas
authRouter.post("/admin/login", authLoginRateLimiter, asyncHandler(loginAdminHandler));
authRouter.post("/admin/logout", asyncHandler(logoutAdminHandler));
authRouter.get("/admin/me", asyncHandler(requireAuth), asyncHandler(meAdminHandler));
