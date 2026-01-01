document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chatForm");
    const questionInput = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");
  
    if (!chatForm || !questionInput || !chatBox) {
      console.error("Elemen chat tidak ditemukan");
      return;
    }
  
    // Load chat history
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.forEach(msg => addMessage(msg.role, msg.text));
  
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const question = questionInput.value.trim();
      if (!question) return;
  
      addMessage("user", question);
      saveHistory("user", question);
      questionInput.value = "";
  
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
        });
  
        const data = await res.json();
        const answer = data.answer || "Tidak ada jawaban.";
  
        addMessage("bot", answer);
        saveHistory("bot", answer);
  
      } catch (err) {
        addMessage("bot", "❌ Terjadi kesalahan server");
      }
    });
  
    function addMessage(role, text) {
      const msg = document.createElement("div");
      msg.className = `message ${role}`;
      msg.textContent = text;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function saveHistory(role, text) {
      history.push({ role, text });
      localStorage.setItem("chatHistory", JSON.stringify(history));
    }
  });
  