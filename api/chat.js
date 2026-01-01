import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ❌ JANGAN dotenv di Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Path file (file ini HARUS ada di repo)
const dataPath = path.join(process.cwd(), "api", "rag-data.json");
const cachePath = path.join(process.cwd(), "api", "embeddings-cache.json");

let pdfChunks = [];
let chunkEmbeddings = [];

// Init RAG (aman untuk serverless)
function initRAG() {
  if (pdfChunks.length > 0) return;

  if (fs.existsSync(dataPath)) {
    pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  }

  if (fs.existsSync(cachePath)) {
    chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }

  console.log("✅ RAG loaded:", pdfChunks.length);
}

// Cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] ** 2;
    mb += b[i] ** 2;
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

export default async function handler(req, res) {
  // ✅ HANDLE GET (biar buka di browser tidak 500)
  if (req.method === "GET") {
    return res.status(200).json({
      status: "API Chat Aktif",
      method: "POST"
    });
  }

  // ❌ Tolak selain POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    initRAG();

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question kosong" });
    }

    // 1️⃣ Embedding
    const embedModel = genAI.getGenerativeModel({
      model: "text-embedding-004"
    });
    const embed = await embedModel.embedContent(question);
    const queryVector = embed.embedding.values;

    // 2️⃣ Retrieval (Top 3)
    const context = pdfChunks
      .map((text, i) => ({
        text,
        score: cosineSimilarity(queryVector, chunkEmbeddings[i])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.text)
      .join("\n\n");

    // 3️⃣ Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
Anda adalah asisten pajak DJP berbasis UU HPP.
Jawab ringkas dan terstruktur.

Dokumen Konteks:
${context}

Pertanyaan:
${question}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ answer: text });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
