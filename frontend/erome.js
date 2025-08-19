async function extractAlbum() {
  const link = document.getElementById('albumLink').value;
  if(!link) return alert("Cole o link do álbum!");

  try {
    const res = await fetch('/api/erome', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ url: link })
    });

    const album = await res.json();

    // Preview do álbum
    const albumPreview = document.getElementById('albumPreview');
    const capa = album.img[0] || '';
    albumPreview.innerHTML = `
      ${capa ? `<img src="${capa}" alt="Capa do Álbum">` : ''}
      <h2>${album.titulo}</h2>
      <button onclick="downloadAllAlbum()">Baixar Todos</button>
    `;

    // Cards individuais
    const container = document.getElementById('videosContainer');
    container.innerHTML = '';

    album.img.forEach((imgUrl, idx)=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `
        <img src="${imgUrl}" alt="Imagem ${idx+1}">
        <h3>Imagem ${idx+1}</h3>
        <button onclick="downloadFile('${imgUrl}')">Baixar</button>
      `;
      container.appendChild(card);
    });

    album.vid.forEach((vidUrl, idx)=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `
        <video src="${vidUrl}" controls width="200"></video>
        <h3>Vídeo ${idx+1}</h3>
        <button onclick="downloadFile('${vidUrl}')">Baixar</button>
      `;
      container.appendChild(card);
    });

    window.downloadAllAlbum = ()=>[...album.img,...album.vid].forEach(downloadFile);

    window.downloadFile = (url)=>{
      const a = document.createElement('a');
      a.href=`/api/download?url=${encodeURIComponent(url)}`;
      a.click();
    }

  } catch(err){
    console.error(err);
    alert("Erro ao extrair álbum.");
  }
}