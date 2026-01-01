import path from "path";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import fs from "fs";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const dataPath = path.join(process.cwd(), "api", "rag-data.json");
const cachePath = path.join(process.cwd(), "api", "embeddings-cache.json");

let pdfChunks = [];
let chunkEmbeddings = [];

// Inisialisasi Database RAG
async function initializeRAG() {
    try {
        if (fs.existsSync(dataPath)) pdfChunks = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        if (fs.existsSync(cachePath)) chunkEmbeddings = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        console.log("🚀 Database RAG Siap!");
    } catch (e) { console.error("Error init:", e); }
}
initializeRAG();

// Similarity check yang dioptimalkan
function fastCosineSimilarity(vecA, vecB) {
    let dotProduct = 0, mA = 0, mB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        mA += vecA[i] * vecA[i];
        mB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

router.post("/", async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).send("No question");

        // 1. Embedding Pertanyaan
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const resEmbed = await embedModel.embedContent(question);
        const queryVector = resEmbed.embedding.values;

        // 2. Retrieval Konteks (Ambil 3 chunk terbaik untuk kecepatan maksimal)
        const context = pdfChunks
            .map((text, i) => ({ text, score: fastCosineSimilarity(queryVector, chunkEmbeddings[i]) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) 
            .map(item => item.text)
            .join("\n\n");

        // 3. Menggunakan Model Gemini 2.5 Flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash" // Menggunakan model terbaru sesuai permintaan
        });
        
        const prompt = `Anda adalah asisten pajak cerdas DJP. Jawab dengan sangat ringkas berdasarkan UU HPP.
        Format wajib: 
        1. Definisi singkat (1 paragraf)
        2. ### Ciri-Ciri (bullet points)
        3. ### Fungsi (bullet points)
        4. ### Jenis Pajak (Tabel Markdown: Jenis | Penjelasan)
        5. ### Alokasi Pendapatan
        
        Sertakan NIK=NPWP atau Pajak Karbon hanya jika relevan dengan konteks.
        
        Dokumen Konteks: ${context}
        Pertanyaan User: ${question}`;

        // Generate konten dengan model 2.5 Flash
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const fullText = response.text();

        res.json({ answer: fullText });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Terjadi kesalahan", details: error.message });
    }
});

export default router;