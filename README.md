Berikut adalah draf file README.md yang telah disesuaikan sepenuhnya dengan proyek PajakAI Anda. File ini mencerminkan penggunaan Gemini 2.5 Flash, arsitektur RAG (Retrieval-Augmented Generation) untuk dokumen hukum pajak Indonesia (UU HPP), dan proses deployment ke Vercel.

🤖 PajakAI Assistant: Smart Tax RAG Chatbot
PajakAI adalah asisten pintar berbasis kecerdasan buatan yang dirancang untuk menjawab pertanyaan seputar regulasi perpajakan di Indonesia, khususnya Undang-Undang Harmonisasi Peraturan Perpajakan (UU HPP).

Sistem ini menggunakan arsitektur RAG (Retrieval-Augmented Generation) modern untuk memastikan setiap jawaban yang diberikan akurat, ringkas, dan berdasarkan dokumen hukum yang sah.

🚀 Fitur Utama
Model Gemini 2.5 Flash: Menggunakan model AI terbaru yang sangat cepat dan seimbang antara kecerdasan dan latensi rendah.

Akurasi Berbasis RAG: Jawaban bersumber langsung dari dokumen regulasi (UU HPP) yang telah diproses menjadi vector database.

Bilingual & Pintar: Mendukung pemrosesan bahasa yang natural dan mampu memahami konteks hukum perpajakan Indonesia.

UI Modern & Responsif: Antarmuka chat yang elegan dengan animasi loading interaktif dan desain yang ramah seluler.

Format Jawaban Terstruktur: Menghasilkan output berupa definisi, poin ciri-ciri, fungsi, hingga tabel Markdown untuk jenis pajak.

🏗️ Arsitektur Sistem
Proyek ini dibangun dengan arsitektur serverless yang efisien:

Frontend: HTML/CSS/JS statis yang ringan, menampilkan antarmuka chat dengan animasi loading titik-titik tepat di bawah pertanyaan user.

Backend (Vercel Serverless): Fungsi Node.js di /api/chat.js yang menangani logika retrieval dan pemanggilan API Gemini.

Vector Database: File rag-data.json yang berisi potongan teks regulasi pajak beserta nilai embedding-nya untuk pencarian semantik yang cepat.

🛠️ Instalasi & Setup Lokal
Prasyarat
Node.js v18 atau lebih baru.

Google AI (Gemini) API Key dari Google AI Studio.

Langkah-langkah
Clone Repositori:

Bash

git clone https://github.com/olorensa/pajakbot.git
cd pajakbot
Instal Dependensi:

Bash

npm install
Konfigurasi Environment: Buat file .env di root folder dan masukkan API Key Anda:

Cuplikan kode

GEMINI_API_KEY="AIzaSy..."
Menjalankan Server Lokal:

Bash

npm run dev
Buka http://localhost:3000 di browser Anda.

☁️ Deployment ke Vercel
Proyek ini dikonfigurasi khusus untuk Vercel dengan pengaturan vercel.json untuk menangani timeout dan menyertakan file data RAG:

Hubungkan repositori GitHub Anda ke akun Vercel.

Tambahkan Environment Variable: GEMINI_API_KEY.

Vercel akan mendeteksi file vercel.json dan melakukan deploy secara otomatis.

📂 Struktur Folder
api/chat.js: Logika utama RAG dan integrasi Gemini 2.5 Flash.

api/rag-data.json: Database vektor pengetahuan pajak.

frontend/: File statis untuk antarmuka pengguna.

indexer.js: Script untuk memproses dokumen PDF menjadi data vektor.

vercel.json: Konfigurasi deployment serverless Vercel.

⚖️ Penafian (Disclaimer)
Chatbot ini dibuat untuk tujuan edukasi dan bantuan informasi awal mengenai UU HPP. Segala keputusan perpajakan tetap harus merujuk pada regulasi resmi DJP atau konsultan pajak profesional.

Made with ❤️ by olorensa