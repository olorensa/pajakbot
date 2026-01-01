import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { chatAnswer } from "./lib/chatCore.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// ✅ STATIC PUBLIC
app.use(express.static(path.join(__dirname, "public")));

// ✅ API CHAT
app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await chatAnswer(question);
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ❌ TIDAK PERLU app.get("/")
app.listen(PORT, () => {
  console.log(`🚀 Local running: http://localhost:${PORT}`);
});
