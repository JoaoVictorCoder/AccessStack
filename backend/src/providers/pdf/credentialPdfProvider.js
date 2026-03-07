import PDFDocument from "pdfkit";

export async function buildCredentialPdf({ credenciado, credencial, qrPngBuffer }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Credencial do Evento", { align: "center" });
    doc.moveDown(1.2);
    doc.fontSize(12).text(`Nome: ${credenciado.nomeCompleto}`);
    doc.text(`Categoria: ${credenciado.categoria}`);
    doc.text(`Codigo unico: ${credencial.codigoUnico}`);
    doc.text(`Status credencial: ${credencial.statusCredencial}`);
    doc.text(`Status credenciamento: ${credenciado.statusCredenciamento}`);
    doc.text(`Emitida em: ${new Date(credencial.emitidaEm).toLocaleString("pt-BR")}`);
    doc.moveDown(1.5);
    doc.text("QR Code", { underline: true });
    doc.image(qrPngBuffer, { fit: [220, 220] });
    doc.moveDown(1);
    doc.fontSize(9).fillColor("#444").text("Documento para uso interno de credenciamento.");
    doc.end();
  });
}
