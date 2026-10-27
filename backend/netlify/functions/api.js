import serverless from "serverless-http";
import { app } from "../../src/app.js";

// O netlify.toml reescreve /api/* para esta funcao. As rotas do Express nao
// tem prefixo, entao o caminho original e normalizado antes de chegar nelas.
const prefixes = ["/.netlify/functions/api", "/api"];

function stripPrefix(req, _res, next) {
  for (const prefix of prefixes) {
    if (req.url === prefix || req.url.startsWith(`${prefix}/`) || req.url.startsWith(`${prefix}?`)) {
      req.url = req.url.slice(prefix.length) || "/";
      if (!req.url.startsWith("/")) {
        req.url = `/${req.url}`;
      }
      break;
    }
  }
  next();
}

const wrapped = (req, res) => stripPrefix(req, res, () => app(req, res));

export const handler = serverless(wrapped, {
  binary: ["application/pdf", "image/*"]
});
