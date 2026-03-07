import { randomUUID } from "node:crypto";

export function requestContextMiddleware(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}
