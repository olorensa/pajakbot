import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadPdfText } from "../api/loadPdf.js"; // Sesuaikan path-nya
import { splitText } from "../api/textSplitter.js"; // Sesuaikan path-nya

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runConversion() {
  try {
    // 1. Tentukan path PDF sumber
    const pdfPath = path.join(__dirname, "../documents/Salinan UU Nomor 7 Tahun 2021.pdf");
    
    console.log("⏳ Membaca PDF...");
    const text = await loadPdfText(pdfPath);
    
    console.log("⏳ Memecah teks menjadi chunks...");
    const chunks = splitText(text);
    
    // 2. Tentukan path JSON tujuan (simpan di folder api agar bisa dibaca chat.js)
    const outputPath = path.join(__dirname, "../api/rag-data.json");
    
    // 3. Tulis file JSON
    fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), "utf-8");
    
    console.log(`✅ Berhasil! File JSON dibuat di: ${outputPath}`);
    console.log(`📊 Total: ${chunks.length} chunks.`);
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  }
}

runConversion();