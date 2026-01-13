const form = document.querySelector("form");
const input = document.querySelector("input");
const chat = document.querySelector("#chat");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = input.value;
  if (!userText.trim()) return; // Jangan kirim jika kosong

  input.value = "";

  // Tampilkan pesan user di UI
  chat.innerHTML += `<p><b>Kamu:</b> ${userText}</p>`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // UBAH: Gunakan 'message' agar sesuai dengan api/chat.js
      body: JSON.stringify({ message: userText }), 
    });

    const data = await res.json();

    if (res.ok) {
      // UBAH: Gunakan 'data.reply' sesuai dengan format JSON dari server
      chat.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
    } else {
      chat.innerHTML += `<p style="color: red;"><b>Error:</b> ${data.error}</p>`;
    }
  } catch (err) {
    chat.innerHTML += `<p style="color: red;"><b>Sistem Kendala:</b> Gagal terhubung ke server.</p>`;
  }

  // Auto scroll ke bawah setiap ada pesan baru
  chat.scrollTop = chat.scrollHeight;
});