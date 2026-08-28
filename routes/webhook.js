import express from 'express';
import { processHealthcareMessage } from '../services/healthcareEngine.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { addLiveWhatsAppMessage } from '../data/mockDatabase.js';

const router = express.Router();
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'automatex_copilot_token';

// Track recently processed message IDs to prevent duplicate webhook processing
const processedMessageIds = new Set();

function isDuplicateMessage(msgId) {
    if (!msgId) return false;
    if (processedMessageIds.has(msgId)) return true;
    processedMessageIds.add(msgId);
    setTimeout(() => processedMessageIds.delete(msgId), 60000);
    return false;
}

/**
 * GET Webhook Verification endpoint for Meta WhatsApp Cloud API & AutobotChat
 */
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && (token === VERIFY_TOKEN || token === 'automatex_copilot_token')) {
            console.log('[Webhook Verification] Webhook verified successfully.');
            return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
    }
    res.sendStatus(400);
});

/**
 * POST Webhook message receiver endpoint
 * Receives real incoming WhatsApp messages from Meta Cloud API or AutobotChat / Goshort
 */
router.post('/', async (req, res) => {
    try {
        // Deduplicate incoming webhooks using message ID
        const msgId = req.body.id || req.body.whts_ref_id || (req.body.context ? req.body.context.id : null);
        if (msgId && isDuplicateMessage(msgId)) {
            console.log(`[Webhook] Skipped duplicate webhook payload for Message ID: ${msgId}`);
            return res.status(200).json({ status: 'Ignored duplicate webhook' });
        }

        // Handle Delivery Status / Report Webhooks
        if (req.body.delivery_time || req.body.template_id || (req.body.status && !req.body.text && !req.body.message && !req.body.entry)) {
            return res.status(200).json({ status: 'Report received' });
        }

        let senderPhone = null;
        let messageText = null;
        let payloadData = null;

        // 1. Structure check for Meta Cloud API message payload
        if (req.body.entry && req.body.entry[0].changes && req.body.entry[0].changes[0].value.messages) {
            const message = req.body.entry[0].changes[0].value.messages[0];
            senderPhone = message.from;

            if (message.type === 'interactive' && message.interactive) {
                if (message.interactive.type === 'list_reply') {
                    payloadData = message.interactive.list_reply.id;
                    messageText = message.interactive.list_reply.title;
                } else if (message.interactive.type === 'button_reply') {
                    payloadData = message.interactive.button_reply.id;
                    messageText = message.interactive.button_reply.title;
                }
            } else {
                messageText = message.text ? message.text.body : '';
            }
        } 
        // 2. AutobotChat / Goshort webhook payload format (sender_id)
        else if (req.body.sender_id) {
            senderPhone = req.body.sender_id;
            if (req.body.type === 'interactive' && req.body.interactive) {
                if (req.body.interactive.type === 'list_reply' || req.body.interactive.list_reply) {
                    payloadData = req.body.interactive.list_reply.id;
                    messageText = req.body.interactive.list_reply.title || req.body.interactive.list_reply.id;
                } else if (req.body.interactive.type === 'button_reply' || req.body.interactive.button_reply) {
                    payloadData = req.body.interactive.button_reply.id;
                    messageText = req.body.interactive.button_reply.title || req.body.interactive.button_reply.id;
                }
            }
            if (!messageText) {
                if (typeof req.body.text === 'object' && req.body.text !== null) {
                    messageText = req.body.text.body || '';
                } else if (typeof req.body.text === 'string') {
                    messageText = req.body.text;
                } else {
                    messageText = req.body.message || '';
                }
            }
        } 
        // 3. Fallback format (from / number / mobile)
        else if (req.body.from || req.body.number || req.body.mobile || req.body.phone) {
            senderPhone = req.body.from || req.body.number || req.body.mobile || req.body.phone;
            if (typeof req.body.text === 'object' && req.body.text !== null) {
                messageText = req.body.text.body || '';
            } else if (typeof req.body.text === 'string') {
                messageText = req.body.text;
            } else {
                messageText = req.body.message || '';
            }
        }

        console.log(`[Incoming WhatsApp Webhook] From: ${senderPhone} | Message: "${messageText}"`);

        if (!senderPhone || !messageText) {
            console.log('[Webhook] Received status/ping payload or missing text.');
            return res.status(200).json({ status: 'Acknowledged status payload' });
        }

        // Process message through Khaira Healthcare Engine
        const botResponse = processHealthcareMessage(senderPhone, messageText, payloadData);

        // Save to Live WhatsApp Messages log for Admin Dashboard
        addLiveWhatsAppMessage(senderPhone, messageText, botResponse.text);

        // Dispatch Outbound WhatsApp message back to patient's real phone!
        await sendWhatsAppMessage(senderPhone, botResponse);

        return res.status(200).json({
            status: 'success',
            senderPhone,
            userMessage: messageText,
            botResponse
        });
    } catch (error) {
        console.error('[Webhook Receiver Error]:', error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;
