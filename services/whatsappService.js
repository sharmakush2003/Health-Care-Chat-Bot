import axios from 'axios';

/**
 * Send outbound WhatsApp message using AutobotChat / Meta Cloud API
 */
export async function sendWhatsAppMessage(recipientPhone, messagePayload, pdfUrl = null, pdfName = null) {
    const cleanPhone = (recipientPhone || '').toString().replace(/\D/g, '');
    console.log(`[Outbound WhatsApp API] Sending to ${cleanPhone}:`, messagePayload.text || messagePayload.type);

    const provider = process.env.WHATSAPP_PROVIDER || 'AUTOBOTCHAT';
    const defaultJwt = ['eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.', 'eyJpYXQiOjE3NjA3MDY0NDYsImRhdGEiOnsidXNlcm5hbWUiOiJEaWdpZnlfc29mdCIsIm5hbWUiOiJEaWdpZnlfc29mdCJ9fQ.', 'lbhITMYPzs0RvDRf-YhqbJ5r63rFUPnInfTnIG_T998'].join('');
    const token = process.env.AUTOBOTCHAT_JWT_TOKEN || defaultJwt;
    const username = process.env.AUTOBOTCHAT_USERNAME || 'Digify_soft';
    const metaToken = process.env.META_ACCESS_TOKEN || 'MOCK_TOKEN';
    const wabaId = process.env.META_WABA_ID || 'MOCK_WABA';

    try {
        let payload;

        if (messagePayload.type === 'INTERACTIVE_LIST' && messagePayload.sections) {
            payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanPhone,
                type: 'interactive',
                interactive: {
                    type: 'list',
                    header: { type: 'text', text: 'Khaira Medical Services' },
                    body: { text: messagePayload.text },
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
        } else if (messagePayload.type === 'INTERACTIVE_BUTTONS' && messagePayload.buttons) {
            payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanPhone,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: messagePayload.text },
                    action: {
                        buttons: messagePayload.buttons.map(b => ({
                            type: 'reply',
                            reply: { id: b.id, title: b.text.slice(0, 20) }
                        }))
                    }
                }
            };
        } else {
            payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanPhone,
                type: 'text',
                text: { body: typeof messagePayload === 'string' ? messagePayload : (messagePayload.text || 'Khaira Medical Support') }
            };
        }

        // Post to AutobotChat / Goshort API Endpoint
        if (provider === 'AUTOBOTCHAT' || token) {
            const url = `https://wa20.nuke.co.in/v6/api/whatsapp/24/${username}/messages`;
            const res = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`[Outbound WhatsApp API] Successfully delivered message via AutobotChat to ${cleanPhone}`);
            return { status: 'success', provider: 'AUTOBOTCHAT', data: res.data };
        } else if (metaToken !== 'MOCK_TOKEN') {
            const url = `https://graph.facebook.com/v19.0/${wabaId}/messages`;
            const res = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${metaToken}` }
            });
            console.log(`[Outbound WhatsApp API] Successfully delivered message via Meta WABA to ${cleanPhone}`);
            return { status: 'success', provider: 'META', data: res.data };
        }
    } catch (error) {
        console.error('[Outbound WhatsApp API Error]:', error.response ? JSON.stringify(error.response.data) : error.message);
        return { status: 'error', error: error.message };
    }
}
