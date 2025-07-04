const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const inputM3U8 = process.env.INPUT_M3U8 || 'http://pfsv.io:80/couto14/211219tv/151.m3u8';
const rtmpUrl = process.env.RTMP_URL || 'rtmp://live.restream.io/live/re_9933311_dea4d58f20c3a1304e9c';

function startRestream() {
  console.log('🔁 Iniciando restream para o RTMP...');

  const ffmpeg = spawn(ffmpegPath, [
    '-re',
    '-user_agent', 'Mozilla/5.0',
    '-i', inputM3U8,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-f', 'flv',
    rtmpUrl
  ]);

  ffmpeg.stdout.on('data', (data) => {
    console.log(`[FFmpeg STDOUT]: ${data.toString()}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`[FFmpeg STDERR]: ${data.toString()}`);
  });

  ffmpeg.on('error', (err) => {
    console.error(`Erro ao iniciar FFmpeg: ${err.message}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`⚠️ FFmpeg finalizou com código ${code}. Reiniciando em 5s...`);
    setTimeout(startRestream, 5000);
  });
}

app.get('/', (req, res) => {
  res.send('Servidor Restream rodando!');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  startRestream();
});
