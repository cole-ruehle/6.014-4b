// Simple CORS proxy to fix the CORS issue
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Proxy all requests to the backend
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request:', req.method, req.url);
  }
}));

app.listen(PORT, () => {
  console.log(`CORS proxy running on http://localhost:${PORT}`);
  console.log('Proxying requests to http://localhost:8000');
});
