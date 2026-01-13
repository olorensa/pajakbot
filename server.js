import "dotenv/config"; // Harus di baris paling atas!
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import chatHandler from "./api/chat.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Setup __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routing API
app.post("/api/chat", chatHandler);

// SPA Fallback: Mengarahkan semua request tak dikenal ke index.html
app.get("*all", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`---`);
  console.log(`✅ Server running at http://localhost:${PORT}`);
  // Cek apakah key terbaca saat startup
  if (process.env.GEMINI_API_KEY) {
    console.log(`🔑 API Key terdeteksi (Karakter awal: ${process.env.GEMINI_API_KEY.substring(0, 5)}...)`);
  } else {
    console.log(`❌ ERROR: API Key TIDAK ditemukan di file .env`);
  }
  console.log(`---`);
});