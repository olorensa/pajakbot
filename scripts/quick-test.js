import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";


// =====================
// CONFIG
// =====================
if (!process.env.GEMINI_API_KEY) {
  console.log("❌ GEMINI_API_KEY belum diset");
  process.exit(1);
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const EMBEDDING_MODEL = "text-embedding-004";
const CHAT_MODEL = "gemini-2.5-flash";

const VECTOR_DB_PATH = path.join(process.cwd(), "data", "vectors.json");

// =====================
// UTILS
// =====================
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function embed(text) {
  const res = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [{ parts: [{ text }] }],
  });
  return res.embeddings[0].values;
}

// =====================
// MAIN
// =====================
async function run() {
  if (!fs.existsSync(VECTOR_DB_PATH)) {
    console.log("❌ vectors.json belum ada");
    return;
  }

  const vectors = JSON.parse(fs.readFileSync(VECTOR_DB_PATH, "utf8"));

  const question = "Apa isi pokok UU Nomor 7 Tahun 2021?";

  console.log("❓ Question:", question);

  // 1️⃣ Embed pertanyaan
  const qEmbedding = await embed(question);

  // 2️⃣ Similarity
  const ranked = vectors
    .map(v => ({
      ...v,
      score: cosineSimilarity(qEmbedding, v.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 3️⃣ Context
  const context = ranked
    .map(
      (r, i) =>
        `(${i + 1}) [${r.source}]\n${r.content}`
    )
    .join("\n\n");

  // 4️⃣ Prompt
  const prompt = `
Jawab HANYA berdasarkan dokumen.
Jika tidak ada jawabannya, bilang "tidak ditemukan di dokumen".

=== DOKUMEN ===
${context}

=== PERTANYAAN ===
${question}
`;

  // 5️⃣ Gemini Flash 2.5
  const res = await genAI.models.generateContent({
    model: CHAT_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
  });

  console.log("\n🧠 JAWABAN:\n");
  console.log(res.text);
}

run();
