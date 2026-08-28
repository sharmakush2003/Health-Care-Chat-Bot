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
    res.status(200).send('Khaira Medical Webhook Listener Ready');
});

/**
 * POST Webhook message receiver endpoint
 * Receives real incoming WhatsApp messages from Meta Cloud API or AutobotChat / Goshort
 */
router.post('/', async (req, res) => {
    console.log('[Incoming Webhook Payload]:', JSON.stringify(req.body));

    // Fast-ack webhook request to prevent AutobotChat / Meta from timing out
    res.status(200).json({ status: 'Processing' });

    try {
        const body = req.body || {};

        // Extract nested payload if AutobotChat wraps payload in `data` or `payload` or `result`
        const target = body.data || body.payload || body.result || body;

        // 1. Check if this is STRICTLY a status update / delivery receipt / read event
        const isDeliveryReceipt = (body.delivery_time || body.template_id || body.event === 'DELIVERY' || body.event === 'READ' || body.status === 'read' || body.status === 'delivered' || body.status === 'sent' || target.status === 'read' || target.status === 'delivered') &&
            !body.text && !body.message && !body.entry && !target.text && !target.message && !target.interactive && !target.body;

        if (isDeliveryReceipt) {
            console.log('[Webhook] Status report / delivery receipt received & ignored.');
            return;
        }

        // 2. Deduplicate incoming webhooks using message ID (only for real message payloads)
        const msgId = body.id || target.id || target.whts_ref_id || (target.context ? target.context.id : null);
        if (msgId && isDuplicateMessage(msgId)) {
            console.log(`[Webhook] Ignored duplicate webhook for Message ID: ${msgId}`);
            return;
        }

        let senderPhone = null;
        let messageText = null;
        let payloadData = null;

        // 1. Structure check for Meta Cloud API message payload
        if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
            const message = body.entry[0].changes[0].value.messages[0];
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
        // 2. AutobotChat / Goshort webhook payload format (sender_id or from or wa_id or phone)
        else {
            senderPhone = target.sender_id || target.from || target.wa_id || target.mobile || target.phone || target.number ||
                          body.sender_id || body.from || body.wa_id || body.mobile || body.phone || body.number;

            // Interactive response handling
            const interactiveObj = target.interactive || body.interactive;
            if (interactiveObj) {
                const listReply = interactiveObj.list_reply || (interactiveObj.type === 'list_reply' ? interactiveObj : null);
                const buttonReply = interactiveObj.button_reply || (interactiveObj.type === 'button_reply' ? interactiveObj : null);

                if (listReply) {
                    payloadData = listReply.id;
                    messageText = listReply.title || listReply.id;
                } else if (buttonReply) {
                    payloadData = buttonReply.id;
                    messageText = buttonReply.title || buttonReply.id;
                }
            }

            if (!messageText) {
                if (typeof target.text === 'object' && target.text !== null) {
                    messageText = target.text.body || target.text.text || '';
                } else if (typeof target.text === 'string') {
                    messageText = target.text;
                } else if (typeof target.message === 'object' && target.message !== null) {
                    messageText = target.message.text || target.message.body || '';
                } else if (typeof target.message === 'string') {
                    messageText = target.message;
                } else {
                    messageText = target.body || target.msg || target.query || body.text || body.message || body.body || '';
                }
            }
        }

        console.log(`[Parsed Webhook Message] From: ${senderPhone} | Message: "${messageText}" | PayloadData: ${payloadData}`);

        if (!senderPhone || (!messageText && !payloadData)) {
            console.log('[Webhook] Missing senderPhone or message content in payload.');
            return;
        }

        // Clean phone number format
        senderPhone = senderPhone.toString().trim();

        // Process message through Healthcare Engine
        const botResponse = processHealthcareMessage(senderPhone, messageText, payloadData);

        // Save to Live WhatsApp Messages log for Admin Dashboard
        addLiveWhatsAppMessage(senderPhone, messageText || payloadData || 'Selection', botResponse.text);

        // Dispatch Outbound WhatsApp message back to patient's real phone!
        const result = await sendWhatsAppMessage(senderPhone, botResponse);
        console.log(`[Webhook Response Dispatch Result]:`, result);

    } catch (error) {
        console.error('[Webhook Processing Error]:', error);
    }
});

export default router;

