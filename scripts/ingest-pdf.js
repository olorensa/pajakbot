import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
// PERBAIKAN: Gunakan nama library yang benar sesuai node_modules kamu
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// 1. Validasi API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY belum di-set di .env");
  process.exit(1);
}

// PERBAIKAN: Inisialisasi sesuai dokumentasi @google/generative-ai
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = "text-embedding-004";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "documents");
const VECTOR_DB_PATH = path.join(ROOT, "data", "vectors.json");

/* =====================
   HELPERS
===================== */
async function embedText(text) {
  try {
    // PERBAIKAN: Cara memanggil embedding yang benar
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("❌ Gagal embedding:", err.message);
    throw err;
  }
}

function chunkText(text, size = 1000, overlap = 200) {
  const chunks = [];
  let i = 0;
  // Bersihkan teks dari karakter aneh hasil PDF parse
  const cleanText = text.replace(/\s+/g, ' ').trim();

  while (i < cleanText.length) {
    chunks.push(cleanText.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

function loadVectors() {
  if (!fs.existsSync(VECTOR_DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(VECTOR_DB_PATH, "utf8"));
  } catch (e) {
    return [];
  }
}

function saveVectors(vectors) {
  fs.mkdirSync(path.dirname(VECTOR_DB_PATH), { recursive: true });
  fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(vectors, null, 2));
}

/* =====================
   INGEST PDF
===================== */
async function ingestPDF(filePath) {
  console.log(`⏳ Memproses: ${path.basename(filePath)}...`);
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  const chunks = chunkText(data.text);
  const vectors = loadVectors();

  console.log(`📄 Terbagi menjadi ${chunks.length} bagian (chunks)`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await embedText(chunk);
  
    vectors.push({
      id: uuidv4(),
      source: path.basename(filePath),
      content: chunk,
      embedding,
    });
  
    if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
      console.log(`   ✅ Selesai ${i + 1}/${chunks.length} koordinat vektor`);
    }
  }

  saveVectors(vectors);
}

/* =====================
   RUN
===================== */
async function run() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error("❌ Folder /documents tidak ditemukan");
    return;
  }

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (!files.length) {
    console.error("❌ Masukkan file PDF ke dalam folder /documents terlebih dahulu");
    return;
  }

  console.log("📂 Ditemukan dokumen:", files);

  for (const file of files) {
    await ingestPDF(path.join(DOCS_DIR, file));
  }

  console.log("\n✨ PROSES SELESAI!");
  console.log("📦 Database vektor disimpan di:", VECTOR_DB_PATH);
}

run();