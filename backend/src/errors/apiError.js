export class ApiError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code || "API_ERROR";
    this.details = options.details;
  }
}

export function badRequest(message, details) {
  return new ApiError(400, message, { code: "BAD_REQUEST", details });
}

export function unauthorized(message = "nao autenticado") {
  return new ApiError(401, message, { code: "UNAUTHORIZED" });
}

export function forbidden(message = "sem permissao") {
  return new ApiError(403, message, { code: "FORBIDDEN" });
}

export function notFound(message = "recurso nao encontrado") {
  return new ApiError(404, message, { code: "NOT_FOUND" });
}
