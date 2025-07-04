const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const inputM3U8 = process.env.INPUT_M3U8 || 'http://aguacomgas.shop:80/999657183/131302792/152309.m3u8';
const rtmpUrl = process.env.RTMP_URL || 'rtmp://live.restream.io/live/re_9933311_dea4d58f20c3a1304e9c';

function startRestream() {
  console.log('🔁 Iniciando restream para o RTMP...');
  console.log('🔧 Comando FFmpeg:');
  console.log(`${ffmpegPath} -re -user_agent "Mozilla/5.0" -i "${inputM3U8}" -c:v copy -c:a aac -f flv "${rtmpUrl}"`);

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
    console.error(`❌ Erro ao iniciar FFmpeg: ${err.message}`);
  });

  ffmpeg.on('exit', (code, signal) => {
    console.warn(`⚠️ FFmpeg saiu com código: ${code} e sinal: ${signal}`);
    console.log('🔁 Tentando reiniciar em 10 segundos...');
    setTimeout(startRestream, 10000);
  });
}

app.get('/', (req, res) => {
  res.send('✅ Servidor Restream ativo!');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  startRestream();
});
