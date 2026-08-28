import axios from 'axios';

const DEFAULT_JWT = ['eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.', 'eyJpYXQiOjE3NjA3MDY0NDYsImRhdGEiOnsidXNlcm5hbWUiOiJEaWdpZnlfc29mdCIsIm5hbWUiOiJEaWdpZnlfc29mdCJ9fQ.', 'lbhITMYPzs0RvDRf-YhqbJ5r63rFUPnInfTnIG_T998'].join('');
const DEFAULT_USERNAME = 'Digify_soft';

/**
 * Robust Outbound WhatsApp Sender with Fail-Safe Plain-Text Fallback
 */
export async function sendWhatsAppMessage(recipientPhone, messagePayload) {
    const rawPhone = (recipientPhone || '').toString().replace(/\D/g, '');
    if (!rawPhone) {
        console.warn('[Outbound WhatsApp] Invalid phone number provided.');
        return { status: 'error', reason: 'invalid_phone' };
    }

    // Prepare 12-digit and 10-digit variants for maximum gateway compatibility
    const phone12 = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const phone10 = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;

    console.log(`[Outbound WhatsApp API] Dispatching message to ${phone12} / ${phone10}...`);

    const token = process.env.AUTOBOTCHAT_JWT_TOKEN || DEFAULT_JWT;
    const username = process.env.AUTOBOTCHAT_USERNAME || DEFAULT_USERNAME;
    const url = `https://wa20.nuke.co.in/v6/api/whatsapp/24/${username}/messages`;

    // Extract raw text for fail-safe fallback
    let plainText = 'Khaira Medical Chatbot Support';
    if (typeof messagePayload === 'string') {
        plainText = messagePayload;
    } else if (messagePayload && messagePayload.text) {
        plainText = messagePayload.text;
    }

    // 1. Try sending full interactive list / buttons payload
    let primaryPayload;
    if (messagePayload && messagePayload.type === 'INTERACTIVE_LIST' && messagePayload.sections) {
        primaryPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone12,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: { type: 'text', text: 'Khaira Medical Services' },
                body: { text: plainText },
                action: {
                    button: messagePayload.listTitle || 'Select Service',
                    sections: messagePayload.sections.map(sec => ({
                        title: sec.title.slice(0, 24),
                        rows: sec.rows.map(r => ({
                            id: r.id,
                            title: r.title.slice(0, 24),
                            description: (r.description || '').slice(0, 72)
                        }))
                    }))
                }
            }
        };
    } else if (messagePayload && messagePayload.type === 'INTERACTIVE_BUTTONS' && messagePayload.buttons) {
        primaryPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone12,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: { text: plainText },
                action: {
                    buttons: messagePayload.buttons.map(b => ({
                        type: 'reply',
                        reply: { id: b.id, title: b.text.slice(0, 20) }
                    }))
                }
            }
        };
    } else {
        primaryPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone12,
            type: 'text',
            text: { body: plainText }
        };
    }

    try {
        console.log(`[Outbound WhatsApp API] Posting primary payload to ${phone12}...`);
        const res = await axios.post(url, primaryPayload, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000
        });
        console.log(`[Outbound WhatsApp API] SUCCESS via Primary Payload to ${phone12}!`);
        return { status: 'success', data: res.data };
    } catch (err1) {
        console.warn(`[Outbound WhatsApp API] Primary payload failed: ${err1.message}. Triggering Plain-Text Fail-Safe Fallback...`);
        
        // 2. Fail-Safe Fallback: Plain Text payload to 12-digit number
        try {
            const fallbackPayload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: phone12,
                type: 'text',
                text: { body: plainText },
                message: plainText
            };
            const res2 = await axios.post(url, fallbackPayload, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 8000
            });
            console.log(`[Outbound WhatsApp API] SUCCESS via Fallback Plain-Text to ${phone12}!`);
            return { status: 'success', fallback: true, data: res2.data };
        } catch (err2) {
            console.warn(`[Outbound WhatsApp API] 12-digit fallback failed: ${err2.message}. Trying 10-digit number ${phone10}...`);
            
            // 3. Last Resort Fallback: Plain Text payload to 10-digit number
            try {
                const fallback10Payload = {
                    to: phone10,
                    type: 'text',
                    text: { body: plainText },
                    message: plainText
                };
                const res3 = await axios.post(url, fallback10Payload, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 8000
                });
                console.log(`[Outbound WhatsApp API] SUCCESS via 10-digit Fallback to ${phone10}!`);
                return { status: 'success', fallback10: true, data: res3.data };
            } catch (err3) {
                console.error(`[Outbound WhatsApp API Error] All outbound delivery attempts failed for ${rawPhone}:`, err3.response ? JSON.stringify(err3.response.data) : err3.message);
                return { status: 'error', error: err3.message };
            }
        }
    }
}
