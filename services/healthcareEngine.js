import { SERVICES, addBooking, getBookings, addEmergencyAlert, CONVERSATION_STATES } from '../data/mockDatabase.js';

const EMERGENCY_KEYWORDS = [
    'chest pain', 'breathing difficulty', 'unconscious', 'emergency',
    'heavy bleeding', 'stroke', 'heart attack', 'severe pain', '108', 'ambulance'
];

/**
 * Health Saathi WhatsApp Conversation Engine by AutomateX.co.in
 * Formats ultra-aesthetic, highly structured, professional WhatsApp messages
 */
export function processHealthcareMessage(userPhone, messageText, payloadData = null) {
    let cleanUserPhone = (userPhone || '').toString().replace(/\D/g, '');
    if (cleanUserPhone.length === 10) cleanUserPhone = '91' + cleanUserPhone;
    const phoneKey = cleanUserPhone || userPhone;

    const text = (messageText || '').trim().toLowerCase();

    // 1. Emergency Clinical Escalation Safeguard Check
    const isEmergency = EMERGENCY_KEYWORDS.some(kw => text.includes(kw));
    if (isEmergency) {
        addEmergencyAlert({
            phone: userPhone,
            patientName: `Patient (${userPhone})`,
            triggerKeyword: text,
        });

        return {
            type: 'TEXT',
            text: `🚨 *URGENT CLINICAL MEDICAL NOTICE* 🚨\n----------------------------------------\nIf the patient is experiencing an immediate life-threatening medical emergency (such as severe chest pain, loss of consciousness, or acute breathing distress):\n\n1️⃣ Please call **108 Emergency Ambulance** or reach the nearest Emergency Room (ER) immediately.\n2️⃣ Our Clinical & Medical Escalation Team has been alerted for this number (${userPhone}).\n----------------------------------------\n*Our home healthcare services are for non-emergency home visits.*`
        };
    }

    // Initialize or load conversation state for user
    if (!CONVERSATION_STATES[phoneKey]) {
        CONVERSATION_STATES[phoneKey] = { step: 'WELCOME', data: {} };
    }
    const state = CONVERSATION_STATES[phoneKey];

    // Reset flow if user sends any greeting or reset command
    const GREETINGS = ['hi', 'hii', 'hiii', 'heyy', 'hey', 'hello', 'namaste', 'menu', 'restart', 'start', '0', 'help', 'healthcare', 'doctor', 'bot', 'khaira', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = GREETINGS.some(g => text === g || text.startsWith(g + ' ') || text.startsWith(g + '!'));

    if (isGreeting) {
        state.step = 'WELCOME';
        state.data = {};
    }

    switch (state.step) {
        case 'WELCOME': {
            state.step = 'MAIN_MENU';
            return {
                type: 'TEXT',
                text: `👋 *Welcome to Health Saathi Chatbot*\n_by AutomateX.co.in_\n\n🩺 *Doctor-Guided Home Healthcare Services*\n----------------------------------------\nWe deliver certified nursing, physiotherapy, caretaker, and diagnostic services directly to your doorstep.\n\n📋 *HOW CAN WE HELP YOU TODAY?*\nPlease reply with a number (*1 to 7*) to select:\n\n1️⃣  *Nursing at Home*\n     └ ₹800 / visit  •  ₹1,500 / 12-hr shift\n\n2️⃣  *Caretaker at Home*\n     └ ₹1,200 / 12-hr  •  ₹2,000 / 24-hr\n\n3️⃣  *Physiotherapy at Home*\n     └ ₹900 / 45-min expert session\n\n4️⃣  *Lab Test / Sample Collection*\n     └ Starts @ ₹500  (Free home collection)\n\n5️⃣  *ECG at Home*\n     └ ₹1,100 / test (Instant digital report)\n\n6️⃣  *Full Tariff Card & Information*\n7️⃣  *Check Booking Status / Track Professional*\n----------------------------------------\n📲 *Reply with option number (1 to 7) to proceed*`
            };
        }

        case 'MAIN_MENU': {
            let selectedServiceId = null;
            if (payloadData && payloadData.startsWith('SERVICE_')) {
                selectedServiceId = payloadData.replace('SERVICE_', '');
            } else if (text === '1' || text.includes('nursing')) selectedServiceId = '1';
            else if (text === '2' || text.includes('caretaker')) selectedServiceId = '2';
            else if (text === '3' || text.includes('physio')) selectedServiceId = '3';
            else if (text === '4' || text.includes('lab')) selectedServiceId = '4';
            else if (text === '5' || text.includes('ecg')) selectedServiceId = '5';
            else if (text === '6' || payloadData === 'OPT_PRICING') {
                return {
                    type: 'TEXT',
                    text: `💰 *HEALTH SAATHI SERVICE TARIFF CARD*\n_AutomateX.co.in Healthcare Tariff_\n----------------------------------------\n1️⃣ *Nursing at Home*: ₹800 / visit or ₹1,500 / 12-hr shift\n2️⃣ *Caretaker at Home*: ₹1,200 / 12-hr or ₹2,000 / 24-hr\n3️⃣ *Physiotherapy at Home*: ₹900 / 45-min session\n4️⃣ *Lab Test / Sample Collection*: Starts @ ₹500\n5️⃣ *ECG at Home*: ₹1,100 / digital report\n----------------------------------------\nReply with *1 to 5* to book a service or *0* for main menu.`
                };
            } else if (text === '7' || payloadData === 'OPT_STATUS') {
                state.step = 'CHECK_STATUS';
                return {
                    type: 'TEXT',
                    text: `🔍 *CHECK BOOKING STATUS*\n----------------------------------------\nPlease enter your **Booking ID** (e.g. *PH-10452* or *NS-10453*) to track your assigned professional:`
                };
            }

            const service = SERVICES.find(s => s.id === selectedServiceId);
            if (service) {
                state.data.service = service;
                state.step = 'CAPTURE_PINCODE';
                return {
                    type: 'TEXT',
                    text: `🩺 *SELECTED SERVICE*: *${service.name}*\n_${service.description}_\n\n💰 *Tariff*: ${service.priceDescription}\n----------------------------------------\n📍 *STEP 1 OF 3: LOCATION PINCODE*\n\nPlease enter the **6-Digit Pincode** or Area Name where the service is required (e.g. *302012*):`
                };
            }

            return {
                type: 'TEXT',
                text: `❌ *Invalid Selection*\n----------------------------------------\nPlease reply with numbers *1 to 5* to select a service, *6* for tariff card, or *7* to check booking status.`
            };
        }

        case 'CAPTURE_PINCODE': {
            const pincode = text.replace(/[^0-9]/g, '');
            state.data.pincode = pincode || text || '302012';
            state.step = 'CAPTURE_DATE';

            return {
                type: 'TEXT',
                text: `📍 *Location Recorded*: *${state.data.pincode}*\n----------------------------------------\n📅 *STEP 2 OF 3: PREFERRED DATE*\n\nWhen would you like the healthcare professional to visit?\n\n1️⃣ *Today*\n2️⃣ *Tomorrow*\n3️⃣ *Custom Date*\n----------------------------------------\n📲 *Reply 1 for Today, 2 for Tomorrow, or type a date (e.g. 30 Aug):*`
            };
        }

        case 'CAPTURE_DATE': {
            let preferredDate = 'Tomorrow';
            if (text === '1' || payloadData === 'DATE_TODAY' || text.includes('today')) preferredDate = 'Today';
            else if (text === '2' || payloadData === 'DATE_TOMORROW' || text.includes('tomorrow')) preferredDate = 'Tomorrow';
            else preferredDate = text;

            state.data.date = preferredDate;
            state.step = 'SELECT_SLOT';

            const service = state.data.service || SERVICES[0];
            let slotsText = `📅 *Date Reserved*: *${preferredDate}*\n----------------------------------------\n🕘 *SELECT PREFERRED TIME SLOT* for **${service.name}**:\n\n`;
            service.slots.forEach((slot, idx) => {
                slotsText += `${idx + 1}️⃣ *${slot}*\n`;
            });
            slotsText += `----------------------------------------\n📲 *Reply with slot number (1 to ${service.slots.length}) or type custom time.*`;

            return {
                type: 'TEXT',
                text: slotsText
            };
        }

        case 'SELECT_SLOT': {
            let slotName = '3:00 PM';
            const service = state.data.service || SERVICES[0];
            const slotIndex = parseInt(text, 10) - 1;

            if (slotIndex >= 0 && slotIndex < service.slots.length) {
                slotName = service.slots[slotIndex];
            } else if (payloadData && payloadData.startsWith('SLOT_')) {
                const idx = parseInt(payloadData.replace('SLOT_', ''), 10);
                slotName = service.slots[idx] || slotName;
            } else if (text) {
                slotName = text;
            }

            state.data.slot = slotName;
            state.step = 'CAPTURE_PATIENT_DETAILS';

            return {
                type: 'TEXT',
                text: `🕘 *Time Slot Reserved*: *${slotName}*\n----------------------------------------\n👤 *STEP 3 OF 3: PATIENT DETAILS*\n\nPlease enter the **Patient Name & Age** (e.g. *Rajesh Sharma, 58 yrs*):`
            };
        }

        case 'CAPTURE_PATIENT_DETAILS': {
            state.data.patientDetails = text;
            state.step = 'CONFIRMATION';

            const service = state.data.service || SERVICES[0];
            const price = service.basePrice;

            return {
                type: 'TEXT',
                text: `📋 *HEALTH SAATHI BOOKING QUOTATION*\n----------------------------------------\n• *Service*: ${service.name}\n• *Patient*: ${text}\n• *Location Pincode*: ${state.data.pincode}\n• *Scheduled Visit*: ${state.data.date} @ ${state.data.slot}\n• *Estimated Charges*: *₹${price}*\n----------------------------------------\n*Would you like to confirm this booking?*\n\n1️⃣  ✅ *Confirm & Book Now*\n2️⃣  ❌ *Cancel*\n----------------------------------------\n📲 *Reply 1 to Confirm or 2 to Cancel.*`
            };
        }

        case 'CONFIRMATION': {
            const CONFIRM_WORDS = ['1', 'yes', 'confirm', 'y', 'ok', 'ha', 'haan', 'sure', 'book', 'done'];
            const isConfirm = CONFIRM_WORDS.some(w => text === w || text.includes(w)) || payloadData === 'CONFIRM_YES';

            if (isConfirm) {
                const service = state.data.service || SERVICES[0];
                const newBooking = addBooking({
                    serviceId: service.id,
                    serviceName: service.name,
                    category: service.category,
                    patientName: state.data.patientDetails || 'Patient',
                    phone: userPhone,
                    pincode: state.data.pincode || '302012',
                    date: state.data.date || 'Tomorrow',
                    slot: state.data.slot || '11:00 AM',
                    amount: service.basePrice,
                    paymentStatus: 'Pending',
                });

                // Reset state
                CONVERSATION_STATES[phoneKey] = { step: 'WELCOME', data: {} };

                const staffName = newBooking.assignedStaff ? `${newBooking.assignedStaff.name} (${newBooking.assignedStaff.phone})` : 'Allocating nearby specialist...';

                return {
                    type: 'BOOKING_CONFIRMED',
                    text: `✅ *BOOKING CONFIRMED & ALLOCATED*\n----------------------------------------\n🆔 *Booking ID*: *${newBooking.id}*\n🩺 *Service*: ${newBooking.serviceName}\n👤 *Patient*: ${newBooking.patientName}\n📅 *Scheduled Date*: ${newBooking.date}\n🕘 *Time Slot*: ${newBooking.slot}\n📍 *Pincode*: ${newBooking.pincode}\n👨‍⚕️ *Assigned Professional*: ${staffName}\n💰 *Total Amount*: ₹${newBooking.amount}\n💳 *Payment*: Pending (Pay on Visit / Online UPI)\n----------------------------------------\n📱 *A WhatsApp reminder will be sent 1 hour before the visit.*`,
                    bookingId: newBooking.id
                };
            }

            CONVERSATION_STATES[phoneKey] = { step: 'WELCOME', data: {} };
            return {
                type: 'TEXT',
                text: `❌ *Booking Cancelled*\n----------------------------------------\nType *menu* or *hi* anytime to start again.`
            };
        }

        case 'CHECK_STATUS': {
            const bookingId = text.toUpperCase();
            const bookings = getBookings();
            const found = bookings.find(b => b.id === bookingId || b.phone === userPhone);

            CONVERSATION_STATES[phoneKey] = { step: 'WELCOME', data: {} };

            if (found) {
                const staff = found.assignedStaff ? `${found.assignedStaff.name} (${found.assignedStaff.phone})` : 'Under Allocation';
                return {
                    type: 'TEXT',
                    text: `📋 *BOOKING DETAILS FOR ${found.id}*\n----------------------------------------\n• *Service*: ${found.serviceName}\n• *Patient*: ${found.patientName}\n• *Status*: 🟢 *${found.status}*\n• *Scheduled Date*: ${found.date} @ ${found.slot}\n• *Assigned Staff*: ${staff}\n• *Payment Status*: ${found.paymentStatus}\n----------------------------------------\nType *menu* to return to main options.`
                };
            }

            return {
                type: 'TEXT',
                text: `❌ No booking found for ID "${bookingId}". Type *menu* to return to main options.`
            };
        }

        default: {
            CONVERSATION_STATES[phoneKey] = { step: 'WELCOME', data: {} };
            return processHealthcareMessage(userPhone, 'menu');
        }
    }
}
