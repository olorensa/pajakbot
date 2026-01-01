import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// fix __dirname di ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// parse JSON
app.use(express.json());

// API local (optional: forward ke api/chat.js)
import chatHandler from "./api/chat.js";
app.post("/api/chat", chatHandler);

// serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Local server running at http://localhost:${PORT}`);
});
