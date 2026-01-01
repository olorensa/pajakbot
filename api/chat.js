import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Inisialisasi Google Generative AI
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Konfigurasi Path: 
 * Menggunakan process.cwd() adalah cara standar di Vercel untuk mengakses root project.
 */
const dataPath = path.join(process.cwd(), "api", "rag-data.json");
const cachePath = path.join(process.cwd(), "api", "embeddings-cache.json");

let pdfChunks = [];
let chunkEmbeddings = [];
let initialized = false;

/**
 * Fungsi initRAG: 
 * Memastikan data hanya dimuat sekali per siklus hidup serverless instance.
 */
function initRAG() {
  if (initialized) return;

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Kritis: File rag-data.json tidak ditemukan di ${dataPath}`);
  }
  if (!fs.existsSync(cachePath)) {
    throw new Error(`Kritis: File embeddings-cache.json tidak ditemukan di ${cachePath}`);
  }

  try {
    pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    initialized = true;
    console.log("✅ RAG system initialized");
  } catch (error) {
    throw new Error("Gagal parsing file JSON: " + error.message);
  }
}

/**
 * Logika Cosine Similarity
 */
function cosineSimilarity(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

/**
 * Serverless Handler
 */
export default async function handler(req, res) {
  // 1. Validasi Method
  if (req.method === "GET") {
    return res.status(200).json({ status: "PajakAI API Aktif" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Pastikan data RAG termuat
    initRAG();

    const { question } = req.body;
    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Pertanyaan kosong" });
    }

    // 3. Embedding Pertanyaan
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embed = await embedModel.embedContent(question);
    const queryVector = embed.embedding.values;

    // 4. Retrieval (Top 3 Context)
    const context = pdfChunks
      .map((text, i) => ({
        text,
        score: cosineSimilarity(queryVector, chunkEmbeddings[i])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.text)
      .join("\n\n");

    // 5. Generate Jawaban (Gemini 2.5 Flash sesuai dashboard Anda)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Anda adalah asisten pajak DJP berbasis UU HPP. 
Jawablah dengan ringkas, jelas, dan terstruktur berdasarkan konteks berikut.

Konteks Dokumen:
${context}

Pertanyaan User:
${question}
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.status(200).json({ answer });

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return res.status(500).json({
      error: "Terjadi kesalahan internal",
      message: err.message
    });
  }
}