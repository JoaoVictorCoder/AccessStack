import { mapCredencialDetail } from "../mappers/identityMapper.js";
import { findCredencialById } from "../repositories/credencialRepository.js";
import {
  getCredentialPdfById,
  getCredentialQrById
} from "../services/credentialAssetService.js";

export async function getCredencialAdminByIdHandler(req, res) {
  const credencial = await findCredencialById(req.params.id);
  if (!credencial) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(mapCredencialDetail(credencial));
}

export async function getCredencialPublicQrHandler(req, res) {
  const data = await getCredentialQrById(req.params.id);
  if (!data) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(data);
}

export async function getCredencialPublicPdfHandler(req, res) {
  const data = await getCredentialPdfById(req.params.id);
  if (!data) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="credencial-${data.credencial.codigoUnico}.pdf"`
  );
  return res.send(data.pdfBuffer);
}
