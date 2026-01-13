import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = "text-embedding-004";
const CHAT_MODEL = "gemini-2.5-flash"; // Menggunakan 1.5-flash untuk stabilitas

const VECTOR_DB_PATH = path.join(process.cwd(), "data", "vectors.json");

// Fungsi menghitung kemiripan teks (Cosine Similarity)
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

export default async function chatHandler(req, res) {
  try {
    // SINKRONISASI: Mengambil 'message' dari body request frontend
    // Menambahkan fallback agar tetap menerima data jika dikirim sebagai 'question'
    const message = req.body.message || req.body.question; 

    if (!message) {
      console.warn("⚠️ Warning: Request diterima tapi pesan kosong.");
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    // 1. Ambil Embedding untuk pertanyaan user
    const modelEmbed = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const resultEmbed = await modelEmbed.embedContent(message);
    const qEmbedding = resultEmbed.embedding.values;

    // 2. Baca Database Vector dari file permanen
    if (!fs.existsSync(VECTOR_DB_PATH)) {
      console.error("❌ Database vektor tidak ditemukan di:", VECTOR_DB_PATH);
      throw new Error("Database pengetahuan belum siap. Silahkan jalankan ingest satu kali.");
    }
    
    const vectors = JSON.parse(fs.readFileSync(VECTOR_DB_PATH, "utf8"));
    
    // Cari 5 potongan teks yang paling relevan dengan pertanyaan
    const ranked = vectors
      .map(v => ({ ...v, score: cosineSimilarity(qEmbedding, v.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = ranked.map(r => r.content).join("\n---\n");

    // 3. Prompt Pintar: Menggunakan 'context' agar AI menjawab berdasarkan dokumen
// Ganti bagian prompt di dalam api/chat.js Anda dengan ini:
const prompt = `
  Anda adalah PajakAI Assistant. Berikan jawaban yang terstruktur, informatif, dan langsung ke inti permasalahan.

  DATA REFERENSI:
  ${context}

  INSTRUKSI FORMAT JAWABAN:
  1. JANGAN PERNAH menyebutkan "Berdasarkan dokumen..." atau "Informasi ini tidak ada".
  2. Gunakan gaya penulisan yang Anda berikan: definisikan secara formal, berikan penjelasan sederhana, gunakan poin-poin untuk ciri-ciri dan fungsi, serta gunakan tabel jika perlu.
  3. Integrasikan detail teknis dari DATA REFERENSI (seperti PPN, Penagihan di Bab IV, atau Keberatan di Bab V) ke dalam penjelasan fungsi atau jenis pajak agar data dokumen tetap terpakai secara profesional.
  4. Pastikan jawaban terlihat bersih dan mudah dibaca (scannable).

  PERTANYAAN USER: ${message}
`;
    const modelChat = genAI.getGenerativeModel({ model: CHAT_MODEL });
    const resultChat = await modelChat.generateContent(prompt);
    
    // Kirim balasan sukses ke frontend
    res.json({ 
      status: "success", 
      reply: resultChat.response.text() 
    });

  } catch (error) {
    console.error("❌ RAG Error:", error.message);
    res.status(500).json({ error: "Gagal memproses permintaan", details: error.message });
  }
}