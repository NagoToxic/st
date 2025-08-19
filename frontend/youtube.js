async function searchVideos() {
  const query = document.getElementById('ytQuery').value;
  if (!query) return alert('Digite um termo ou cole link do vídeo');

  try {
    const res = await fetch(`/api/yt/search?query=${encodeURIComponent(query)}`);
    const videos = await res.json();

    const container = document.getElementById('videosContainer');
    container.innerHTML = '';

    videos.forEach(v => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${v.thumbnail}" alt="${v.title}">
        <h3>${v.title}</h3>
        <p>Duração: ${v.duration}</p>
        <button onclick="downloadYT('${v.url}','video')">Baixar Vídeo</button>
        <button onclick="downloadYT('${v.url}','audio')">Baixar Áudio</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert('Erro ao buscar vídeos');
  }
}

function downloadYT(url, type) {
  // Cria link temporário para download
  const a = document.createElement('a');
  a.href = `/api/yt/download?url=${encodeURIComponent(url)}&type=${type}`;
  a.click();
}