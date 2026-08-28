import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import webhookRoutes from './routes/webhook.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Meta WhatsApp Webhook endpoints
app.use('/api/webhook', webhookRoutes);

// Admin REST APIs
app.use('/api', apiRoutes);

// Serve static frontend files if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'AutomateX Healthcare WhatsApp Bot & ERP Backend',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏥 AutomateX Healthcare Bot Server Running on Port ${PORT}`);
    console.log(`📲 Meta Webhook Verification URL: http://localhost:${PORT}/api/webhook`);
    console.log(`📊 Admin REST API URL: http://localhost:${PORT}/api/stats`);
    console.log(`======================================================\n`);
});
