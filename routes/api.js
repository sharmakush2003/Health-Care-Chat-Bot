import express from 'express';
import axios from 'axios';
import { getBookings, updateBookingStatus, STAFF_POOL, EMERGENCY_ALERTS, SERVICES, getLiveMessages, addLiveWhatsAppMessage } from '../data/mockDatabase.js';
import { processHealthcareMessage } from '../services/healthcareEngine.js';
import { generateBookingPDF } from '../services/pdfGenerator.js';

const router = express.Router();
const RENDER_LIVE_URL = 'https://garments-erp-bot.onrender.com';

// Get all bookings (with fallback to live Render server if local DB is empty)
router.get('/bookings', async (req, res) => {
    let localBookings = getBookings();
    if (localBookings.length === 0 && !process.env.RENDER) {
        try {
            const remoteRes = await axios.get(`${RENDER_LIVE_URL}/api/bookings`, { timeout: 3000 });
            if (remoteRes.data && Array.isArray(remoteRes.data.bookings) && remoteRes.data.bookings.length > 0) {
                return res.json({ bookings: remoteRes.data.bookings });
            }
        } catch (e) {
            // Ignore offline/timeout errors
        }
    }
    res.json({ bookings: localBookings });
});

// Get live WhatsApp message feed (with fallback to live Render server if local DB is empty)
router.get('/messages', async (req, res) => {
    let localMessages = getLiveMessages();
    if (localMessages.length === 0 && !process.env.RENDER) {
        try {
            const remoteRes = await axios.get(`${RENDER_LIVE_URL}/api/messages`, { timeout: 3000 });
            if (remoteRes.data && Array.isArray(remoteRes.data.messages) && remoteRes.data.messages.length > 0) {
                return res.json({ messages: remoteRes.data.messages });
            }
        } catch (e) {
            // Ignore offline/timeout errors
        }
    }
    res.json({ messages: localMessages });
});

// Update booking status / staff
router.put('/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status, staffId } = req.body;
    const updated = updateBookingStatus(id, status, staffId);
    if (updated) {
        return res.json({ success: true, booking: updated });
    }
    return res.status(404).json({ error: 'Booking not found' });
});

// Get staff pool
router.get('/staff', (req, res) => {
    res.json({ staff: STAFF_POOL });
});

// Get services list
router.get('/services', (req, res) => {
    res.json({ services: SERVICES });
});

// Get emergency alerts
router.get('/emergency', (req, res) => {
    res.json({ alerts: EMERGENCY_ALERTS });
});

// Get Dashboard KPI Metrics (with fallback to live Render server)
router.get('/stats', async (req, res) => {
    const bookings = getBookings();
    const messages = getLiveMessages();

    if (messages.length === 0 && !process.env.RENDER) {
        try {
            const remoteRes = await axios.get(`${RENDER_LIVE_URL}/api/stats`, { timeout: 3000 });
            if (remoteRes.data && remoteRes.data.stats && remoteRes.data.stats.totalEnquiries > 0) {
                return res.json({ stats: remoteRes.data.stats });
            }
        } catch (e) {
            // Ignore offline/timeout errors
        }
    }

    const stats = {
        totalEnquiries: messages.length,
        todaysBookings: bookings.length,
        pendingAssignment: bookings.filter(b => b.status === 'Pending Assignment').length,
        assigned: bookings.filter(b => b.status === 'Assigned').length,
        onTheWay: bookings.filter(b => b.status === 'On the way').length,
        completed: bookings.filter(b => b.status === 'Completed').length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        emergencyAlertsCount: EMERGENCY_ALERTS.length
    };
    res.json({ stats });
});

// Download PDF Invoice / Receipt
router.get('/bookings/:id/invoice', async (req, res) => {
    const { id } = req.params;
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id) || bookings[0];

    try {
        const pdfBuffer = await generateBookingPDF(booking);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_${booking.id}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate PDF invoice', details: err.message });
    }
});

// Simulated WhatsApp Chat trigger for testing from dashboard
router.post('/simulate-chat', async (req, res) => {
    const { phone, message, payload } = req.body;
    const userPhone = phone || '918233816674';

    const botReply = processHealthcareMessage(userPhone, message, payload);
    const newMsg = addLiveWhatsAppMessage(userPhone, message, botReply.text, 'Patient (Test)');

    // Also forward simulation to Render if running locally so Render stores it too!
    if (!process.env.RENDER) {
        try {
            await axios.post(`${RENDER_LIVE_URL}/api/simulate-chat`, {
                phone: userPhone,
                message,
                payload
            }, { timeout: 3000 });
        } catch (e) {}
    }

    res.json({
        success: true,
        userMessage: message,
        botReply
    });
});

export default router;
