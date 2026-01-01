import fs from "fs";
import pdf from "pdf-parse";

export async function loadPdfText(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}
