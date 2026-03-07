import QRCode from "qrcode";

export async function toDataUrl(payload) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320
  });
}

export async function toPngBuffer(payload) {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320
  });
}
