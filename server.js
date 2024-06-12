const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://opendata.aemet.es',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Elimina el prefijo '/api' antes de enviar la solicitud a la API de AEMET
  },
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
