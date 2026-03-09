import { listStandVisitorsReport } from "../repositories/accessAttemptRepository.js";
import { parseOptionalStringQuery } from "../http/queryParsers.js";
import { resolveComissaoScopeFromAuth } from "../http/actorContext.js";

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!name || !domain) return null;
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `***${digits.slice(-4)}`;
}

export async function standVisitorsReportHandler(req, res) {
  const scope = resolveComissaoScopeFromAuth(req.auth);

  const items = await listStandVisitorsReport({
    standId: parseOptionalStringQuery(req.query, "standId"),
    operatorId: parseOptionalStringQuery(req.query, "operatorId"),
    comissaoResponsavelId: parseOptionalStringQuery(req.query, "comissaoResponsavelId"),
    empresaVinculadaId: parseOptionalStringQuery(req.query, "empresaVinculadaId"),
    categoria: parseOptionalStringQuery(req.query, "categoria"),
    dateFrom: parseOptionalStringQuery(req.query, "dateFrom"),
    dateTo: parseOptionalStringQuery(req.query, "dateTo"),
    scope
  });

  const data = items.map((item) => {
    const credenciado = item.credencial?.credenciado;
    const consent = credenciado?.aceitouCompartilhamentoComExpositores === true;
    return {
      accessAttemptId: item.id,
      standId: item.standId,
      standName: item.standName,
      empresaNome: item.empresaNome,
      empresaVinculadaId: item.empresaVinculadaId,
      empresaVinculadaNome: item.empresaVinculadaNome,
      comissaoResponsavelId: item.comissaoResponsavelId,
      comissaoResponsavelNome: item.comissaoResponsavelNome,
      operatorId: item.operatorId,
      operatorNome: item.operatorNome,
      operatorEmail: item.operatorEmail,
      createdAt: item.createdAt,
      visitor: credenciado
        ? {
            id: consent ? credenciado.id : null,
            nomeCompleto: consent ? credenciado.nomeCompleto : "Nao autorizado (LGPD)",
            email: consent ? credenciado.email : maskEmail(credenciado.email),
            celular: consent ? credenciado.celular : maskPhone(credenciado.celular),
            categoria: credenciado.categoria,
            municipio: credenciado.municipio,
            uf: credenciado.uf,
            aceitouCompartilhamentoComExpositores: consent
          }
        : null
    };
  });

  return res.json({
    items: data,
    total: data.length
  });
}
