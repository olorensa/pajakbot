import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

/* =====================
   PDF PARSER (CJS)
===================== */
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/* =====================
   CONFIG
===================== */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY belum di-set");
  process.exit(1);
}

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const EMBEDDING_MODEL = "text-embedding-004";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "documents");
const VECTOR_DB_PATH = path.join(ROOT, "data", "vectors.json");

/* =====================
   HELPERS
===================== */
async function embedText(text) {
  const result = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [
      {
        parts: [{ text }],
      },
    ],
  });

  return result.embeddings[0].values;
}

function chunkText(text, size = 800, overlap = 100) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }

  return chunks;
}

function loadVectors() {
  if (!fs.existsSync(VECTOR_DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(VECTOR_DB_PATH, "utf8"));
}

function saveVectors(vectors) {
  fs.mkdirSync(path.dirname(VECTOR_DB_PATH), { recursive: true });
  fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(vectors, null, 2));
}

/* =====================
   INGEST PDF
===================== */
async function ingestPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  const chunks = chunkText(data.text);
  const vectors = loadVectors();

  console.log(`📄 ${path.basename(filePath)} → ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
  
    const embedding = await embedText(chunk);
  
    vectors.push({
      id: uuidv4(),
      source: path.basename(filePath),
      content: chunk,
      embedding,
    });
  
    if (i % 10 === 0) {
      console.log(`   ⏳ ${i + 1}/${chunks.length} embeddings`);
    }
  }
  

  saveVectors(vectors);
}

/* =====================
   RUN
===================== */
async function run() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error("❌ Folder /documents tidak ada");
    return;
  }

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (!files.length) {
    console.error("❌ Tidak ada PDF di /documents");
    return;
  }

  console.log("📂 Documents:", files);

  for (const file of files) {
    await ingestPDF(path.join(DOCS_DIR, file));
  }

  console.log("✅ PDF ingestion complete");
  console.log("📦 Vector DB:", VECTOR_DB_PATH);
}

run();
