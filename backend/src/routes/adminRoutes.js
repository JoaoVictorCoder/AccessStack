import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth, requireRoles } from "../middlewares/authMiddleware.js";
import {
  createComissaoAdminHandler,
  getCredenciadoAdminByIdHandler,
  listCredenciadoEventosAdminHandler,
  listCredenciadosAdminHandler
} from "../controllers/credenciadoController.js";
import { getCredencialAdminByIdHandler } from "../controllers/credencialController.js";
import { listEventosSistemaAdminHandler } from "../controllers/eventoSistemaController.js";
import { listAuditLogsAdminHandler } from "../controllers/auditLogController.js";
import { validateCheckInHandler } from "../controllers/checkInController.js";
import {
  analyticsFraudHandler,
  analyticsOverviewHandler
} from "../controllers/analyticsController.js";
import { AdminRole } from "../domain/enums.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAuth));

adminRouter.get(
  "/credenciados",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listCredenciadosAdminHandler)
);
adminRouter.get(
  "/credenciados/:id",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getCredenciadoAdminByIdHandler)
);
adminRouter.get(
  "/credenciados/:id/eventos",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listCredenciadoEventosAdminHandler)
);
adminRouter.post(
  "/credenciados/comissao-organizadora",
  asyncHandler(requireRoles([AdminRole.ADMIN])),
  asyncHandler(createComissaoAdminHandler)
);
adminRouter.get(
  "/credenciais/:id",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getCredencialAdminByIdHandler)
);
adminRouter.get(
  "/eventos",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listEventosSistemaAdminHandler)
);
adminRouter.get(
  "/audit-logs",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listAuditLogsAdminHandler)
);
adminRouter.post(
  "/check-in/validate",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.APP_GATE, AdminRole.SYSTEM])),
  asyncHandler(validateCheckInHandler)
);
adminRouter.get(
  "/analytics/overview",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(analyticsOverviewHandler)
);
adminRouter.get(
  "/analytics/fraud",
  asyncHandler(requireRoles([AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(analyticsFraudHandler)
);
