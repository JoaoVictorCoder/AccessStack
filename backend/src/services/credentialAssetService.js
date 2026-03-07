import { findCredencialById } from "../repositories/credencialRepository.js";
import { buildCredentialPdf } from "../providers/pdf/credentialPdfProvider.js";
import { toDataUrl, toPngBuffer } from "../providers/qrcode/qrcodeProvider.js";

export async function getCredentialQrById(credencialId) {
  const credencial = await findCredencialById(credencialId);
  if (!credencial) {
    return null;
  }

  const dataUrl = await toDataUrl(credencial.qrCodePayload);
  return {
    credencial: {
      id: credencial.id,
      codigoUnico: credencial.codigoUnico,
      statusCredencial: credencial.statusCredencial
    },
    qrcode: dataUrl
  };
}

export async function getCredentialPdfById(credencialId) {
  const credencial = await findCredencialById(credencialId);
  if (!credencial) {
    return null;
  }

  const qrBuffer = await toPngBuffer(credencial.qrCodePayload);
  const pdfBuffer = await buildCredentialPdf({
    credenciado: credencial.credenciado,
    credencial,
    qrPngBuffer: qrBuffer
  });

  return {
    credencial,
    pdfBuffer
  };
}
