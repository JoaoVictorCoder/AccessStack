const result = document.getElementById("result");
const button = document.getElementById("loadMessageBtn");

async function loadMessage() {
  result.textContent = "Carregando...";

  try {
    const response = await fetch("http://127.0.0.1:5000/api/message");

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    result.textContent = `Falha ao chamar API: ${error.message}`;
  }
}

button.addEventListener("click", loadMessage);
