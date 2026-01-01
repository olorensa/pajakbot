const form = document.querySelector("form");
const input = document.querySelector("input");
const chat = document.querySelector("#chat");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = input.value;
  input.value = "";

  chat.innerHTML += `<p><b>Kamu:</b> ${question}</p>`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  chat.innerHTML += `<p><b>AI:</b> ${data.answer}</p>`;
});
