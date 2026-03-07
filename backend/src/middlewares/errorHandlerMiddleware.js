import { ApiError } from "../errors/apiError.js";

function extractPrismaConflictTarget(error) {
  const target = error?.meta?.target;
  if (Array.isArray(target) && target.length > 0) {
    return target.join(", ");
  }
  return null;
}

function normalizeKnownError(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        code: error.code,
        details: error.details
      }
    };
  }

  if (error?.name === "JsonWebTokenError") {
    return {
      status: 401,
      body: { error: "token invalido", code: "JWT_INVALID" }
    };
  }

  if (error?.name === "TokenExpiredError") {
    return {
      status: 401,
      body: { error: "token expirado", code: "JWT_EXPIRED" }
    };
  }

  if (error?.type === "entity.parse.failed") {
    return {
      status: 400,
      body: { error: "json invalido no corpo da requisicao", code: "INVALID_JSON" }
    };
  }

  if (error?.code === "P2002") {
    const target = extractPrismaConflictTarget(error);
    return {
      status: 409,
      body: {
        error: target
          ? `registro duplicado: campo(s) ${target}`
          : "registro duplicado",
        code: "UNIQUE_CONSTRAINT"
      }
    };
  }

  if (error?.code === "P2025") {
    return {
      status: 404,
      body: { error: "registro nao encontrado", code: "RECORD_NOT_FOUND" }
    };
  }

  if (error?.code === "P2023") {
    return {
      status: 400,
      body: { error: "formato de identificador invalido", code: "INVALID_IDENTIFIER" }
    };
  }

  if (error?.code === "P2003") {
    return {
      status: 409,
      body: { error: "violacao de integridade referencial", code: "FK_CONSTRAINT" }
    };
  }

  return null;
}

export function errorHandlerMiddleware(error, req, res, _next) {
  const known = normalizeKnownError(error);
  if (known) {
    return res.status(known.status).json({
      ...known.body,
      requestId: req.requestId
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  } else {
    console.error(`erro interno na API [requestId=${req.requestId}]`);
  }

  return res.status(500).json({
    error: "erro interno inesperado",
    code: "INTERNAL_ERROR",
    requestId: req.requestId
  });
}
