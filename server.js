import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import webhookRoutes from './routes/webhook.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Live diagnostic log store for remote inspection
const logStore = [];
const maxLogs = 150;
function captureLog(type, args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    const timestamp = new Date().toISOString();
    logStore.push(`[${timestamp}] [${type}] ${message}`);
    if (logStore.length > maxLogs) logStore.shift();
}
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => { captureLog('INFO', args); originalLog(...args); };
console.error = (...args) => { captureLog('ERROR', args); originalError(...args); };
console.warn = (...args) => { captureLog('WARN', args); originalWarn(...args); };

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Remote diagnostics endpoint
app.get('/logs', (req, res) => {
    res.type('text/plain').send(logStore.join('\n'));
});

// Meta & AutobotChat WhatsApp Webhook endpoints (Support /api/webhook, /webhook, /api/v1/webhook)
app.use('/api/webhook', webhookRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/v1/webhook', webhookRoutes);

// Admin REST APIs
app.use('/api', apiRoutes);

// Serve static frontend files if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Khaira Medical WhatsApp Bot & ERP Backend',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏥 Khaira Medical WhatsApp Bot Server Running on Port ${PORT}`);
    console.log(`📲 Meta Webhook Verification URL: http://localhost:${PORT}/api/webhook`);
    console.log(`📊 Admin REST API URL: http://localhost:${PORT}/api/stats`);
    console.log(`======================================================\n`);
});
