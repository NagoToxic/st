const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const axios = require("axios");
const { spawn } = require("child_process");
const ytSearch = require("yt-search");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rota proxy para extrair álbum EroMe
app.post("/api/erome", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL não informada" });

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const album = {
            titulo: $("h1").first().text().trim() || "Sem título",
            img: [],
            vid: []
        };

        $("img").each((i, el) => {
            const src = $(el).attr("src");
            if (src?.includes("erome.com")) album.img.push(src);
        });

        $("video source").each((i, el) => {
            const src = $(el).attr("src");
            if (src?.includes("erome.com")) album.vid.push(src);
        });

        // Remove duplicados
        album.img = [...new Set(album.img)];
        album.vid = [...new Set(album.vid)];

        res.json(album);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar álbum" });
    }
});

// Rota para download direto via backend
app.get("/api/download", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send("URL não informada");

        const filename = url.split("/").pop();
        const response = await axios.get(url, { responseType: "stream" });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );
        response.data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao baixar o arquivo");
    }
});

// Rota de pesquisa de vídeos
app.get("/api/yt/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query não informada" });

    try {
        const result = await ytSearch(query);
        const videos = result.videos.slice(0, 10).map(v => ({
            title: v.title,
            url: v.url,
            thumbnail: v.image,
            duration: v.timestamp
        }));
        res.json(videos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar vídeos" });
    }
});

// Rota de download de vídeo/áudio com nome do vídeo
app.get('/api/yt/download', async (req, res) => {
  const { url, type } = req.query;
  if (!url) return res.status(400).send('URL não informada');

  try {
    // Busca título do vídeo
    const info = await ytSearch(url);
    const video = info.videos[0];
    const title = video.title.replace(/[^a-zA-Z0-9 \-_.]/g, ''); // Remove caracteres inválidos
    const filename = `${title}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const format = type === 'audio' ? 'bestaudio[ext=m4a]' : 'bestvideo+bestaudio';
    const ytdlp = spawn('yt-dlp', ['-f', format, '-o', '-', url]);

    ytdlp.stdout.pipe(res);
    ytdlp.stderr.on('data', data => console.error(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao baixar vídeo');
  }
});


// Rodar servidor
app.listen(PORT, () =>
    console.log(`🚀 API e frontend rodando na porta ${PORT}`)
);
