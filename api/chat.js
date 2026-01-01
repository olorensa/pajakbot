import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini init (Vercel pakai env bawaan, JANGAN dotenv)
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Path data RAG (HARUS ada di repo)
 */
const dataPath = path.join(process.cwd(), "api", "rag-data.json");
const cachePath = path.join(process.cwd(), "api", "embeddings-cache.json");

/**
 * Cache memory (aman untuk serverless)
 */
let pdfChunks = [];
let chunkEmbeddings = [];
let initialized = false;

/**
 * Init RAG sekali per cold start
 */
function initRAG() {
  if (initialized) return;

  if (!fs.existsSync(dataPath)) {
    throw new Error("rag-data.json tidak ditemukan");
  }

  if (!fs.existsSync(cachePath)) {
    throw new Error("embeddings-cache.json tidak ditemukan");
  }

  pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));

  initialized = true;
  console.log("✅ RAG loaded:", pdfChunks.length, "chunks");
}

/**
 * Fast cosine similarity
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
 * Vercel Serverless Handler
 */
export default async function handler(req, res) {
  // ✅ Allow browser open
  if (req.method === "GET") {
    return res.status(200).json({
      status: "PajakAI API aktif",
      method: "POST"
    });
  }

  // ❌ Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    initRAG();

    const { question } = req.body;
    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question kosong" });
    }

    /**
     * 1️⃣ Embedding pertanyaan
     */
    const embedModel = genAI.getGenerativeModel({
      model: "text-embedding-004"
    });

    const embed = await embedModel.embedContent(question);
    const queryVector = embed.embedding.values;

    /**
     * 2️⃣ Retrieval Top 3
     */
    const context = pdfChunks
      .map((text, i) => ({
        text,
        score: cosineSimilarity(queryVector, chunkEmbeddings[i])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.text)
      .join("\n\n");

    /**
     * 3️⃣ Gemini 2.5 Flash
     */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
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
      details: err.message
    });
  }
}
