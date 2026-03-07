import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth, requireRoles } from "../middlewares/authMiddleware.js";
import { AdminRole } from "../domain/enums.js";
import {
  createInternalUserHandler,
  listInternalUsersHandler,
  updateInternalUserActiveHandler,
  updateInternalUserHandler
} from "../controllers/internalUserController.js";
import { listAccessLogsAdminHandler } from "../controllers/accessLogController.js";

export const commissionRouter = Router();

commissionRouter.use(asyncHandler(requireAuth));
commissionRouter.use(
  asyncHandler(
    requireRoles([
      AdminRole.COMISSAO_ORGANIZADORA,
      AdminRole.MASTER_ADMIN,
      AdminRole.SYSTEM
    ])
  )
);

commissionRouter.get("/operators", asyncHandler(listInternalUsersHandler));
commissionRouter.post("/operators", asyncHandler(createInternalUserHandler));
commissionRouter.put("/operators/:id", asyncHandler(updateInternalUserHandler));
commissionRouter.patch("/operators/:id/active", asyncHandler(updateInternalUserActiveHandler));
commissionRouter.get("/access-logs", asyncHandler(listAccessLogsAdminHandler));
