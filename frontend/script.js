function openPlatform(platform) {
  alert(`Abrindo página da plataforma: ${platform}`);
  // aqui você coloca a função real depois
}

function filterPlatforms() {
  const input = document.getElementById("search").value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(input) ? "block" : "none";
  });
}