import express from 'express';
import { getBookings, updateBookingStatus, STAFF_POOL, EMERGENCY_ALERTS, SERVICES, getLiveMessages, addLiveWhatsAppMessage } from '../data/mockDatabase.js';
import { processHealthcareMessage } from '../services/healthcareEngine.js';
import { generateBookingPDF } from '../services/pdfGenerator.js';

const router = express.Router();

// Get all bookings
router.get('/bookings', (req, res) => {
    res.json({ bookings: getBookings() });
});

// Get live WhatsApp message feed
router.get('/messages', (req, res) => {
    res.json({ messages: getLiveMessages() });
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

// Get Dashboard KPI Metrics
router.get('/stats', (req, res) => {
    const bookings = getBookings();
    const messages = getLiveMessages();
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
router.post('/simulate-chat', (req, res) => {
    const { phone, message, payload } = req.body;
    const userPhone = phone || '+91 90450 99111';

    const botReply = processHealthcareMessage(userPhone, message, payload);
    addLiveWhatsAppMessage(userPhone, message, botReply.text);

    res.json({
        success: true,
        userMessage: message,
        botReply
    });
});

export default router;
