import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY belum diset");
  process.exit(1);
}

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = "text-embedding-004";
const CHAT_MODEL = "gemini-2.5-flash";

const VECTOR_DB_PATH = path.join(process.cwd(), "data", "vectors.json");

// =======================
// UTILS
// =======================
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

async function embed(text) {
  const res = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [{ parts: [{ text }] }],
  });
  return res.embeddings[0].values;
}

// =======================
// CHAT FUNCTION
// =======================
export async function chat(question) {
  const vectors = JSON.parse(fs.readFileSync(VECTOR_DB_PATH, "utf8"));

  const qEmbedding = await embed(question);

  const ranked = vectors
    .map(v => ({
      ...v,
      score: cosineSimilarity(qEmbedding, v.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = ranked.map(r => r.content).join("\n---\n");

  const prompt = `
Kamu adalah asisten hukum.
Jawab HANYA berdasarkan dokumen berikut.
Jika jawabannya tidak ada di dokumen, katakan tidak ditemukan.

DOKUMEN:
${context}

PERTANYAAN:
${question}

JAWABAN:
`;

  const result = await genAI.models.generateContent({
    model: CHAT_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return result.text;
}
