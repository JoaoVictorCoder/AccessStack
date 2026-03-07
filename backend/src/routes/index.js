import { Router } from "express";
import { adminRouter } from "./adminRoutes.js";
import { authRouter } from "./authRoutes.js";
import { publicRouter } from "./publicRoutes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/", publicRouter);
