import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const dataPath = path.join(process.cwd(), "api", "rag-data.json");
const cachePath = path.join(process.cwd(), "api", "embeddings-cache.json");

let pdfChunks = [];
let chunkEmbeddings = [];

function initRAG() {
  if (pdfChunks.length) return;
  pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));
}

function cosineSimilarity(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] ** 2;
    mb += b[i] ** 2;
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

export async function chatAnswer(question) {
  initRAG();

  const embedModel = genAI.getGenerativeModel({
    model: "text-embedding-004"
  });

  const embed = await embedModel.embedContent(question);
  const queryVector = embed.embedding.values;

  const context = pdfChunks
    .map((text, i) => ({
      text,
      score: cosineSimilarity(queryVector, chunkEmbeddings[i])
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.text)
    .join("\n\n");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
Anda adalah asisten pajak DJP berbasis UU HPP.

Konteks:
${context}

Pertanyaan:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
