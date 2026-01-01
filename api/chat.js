import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Perbaikan Path: Menggunakan path.resolve agar aman di Vercel
 */
const dataPath = path.resolve(process.cwd(), "api", "rag-data.json");
const cachePath = path.resolve(process.cwd(), "api", "embeddings-cache.json");

let pdfChunks = [];
let chunkEmbeddings = [];
let initialized = false;

function initRAG() {
  if (initialized) return;

  if (!fs.existsSync(dataPath) || !fs.existsSync(cachePath)) {
    // Memberikan info lebih detail jika file hilang
    throw new Error(`File JSON tidak ditemukan di path: ${dataPath}`);
  }

  pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));

  initialized = true;
  console.log("✅ RAG loaded:", pdfChunks.length, "chunks");
}

function cosineSimilarity(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "PajakAI API aktif" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    initRAG();

    const { question } = req.body;
    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question kosong" });
    }

    // 1️⃣ Embedding
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embed = await embedModel.embedContent(question);
    const queryVector = embed.embedding.values;

    // 2️⃣ Retrieval
    const context = pdfChunks
      .map((text, i) => ({
        text,
        score: cosineSimilarity(queryVector, chunkEmbeddings[i])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.text)
      .join("\n\n");

    // 3️⃣ Gemini - PERBAIKAN NAMA MODEL
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" // Gunakan 1.5-flash atau 2.0-flash-exp
    });

    const prompt = `
Anda adalah asisten pajak DJP berbasis UU HPP.
Jawab ringkas, jelas, dan terstruktur.

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
      error: "Server error",
      details: err.message // Ini akan membantu kamu melihat error spesifik di browser
    });
  }
}