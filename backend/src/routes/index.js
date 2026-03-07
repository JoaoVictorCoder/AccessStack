import { Router } from "express";
import { adminRouter } from "./adminRoutes.js";
import { authRouter } from "./authRoutes.js";
import { commissionRouter } from "./commissionRoutes.js";
import { operatorRouter } from "./operatorRoutes.js";
import { publicRouter } from "./publicRoutes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/commission", commissionRouter);
router.use("/operator", operatorRouter);
router.use("/", publicRouter);
