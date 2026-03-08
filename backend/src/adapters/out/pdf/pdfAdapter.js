// Adapter de saida para PDF.
// Mantem a aplicacao desacoplada do provider concreto; se a geracao migrar
// para outra biblioteca ou microservico, a troca deve acontecer abaixo.
export { buildCredentialPdf as generateCredentialPdf } from "../../../providers/pdf/credentialPdfProvider.js";
