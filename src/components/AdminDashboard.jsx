import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, AlertTriangle, CheckCircle, Clock, Truck, ShieldAlert, FileText, Download, Phone, RefreshCw, MessageSquare, Send, CheckCheck, Sparkles, Stethoscope, UserCheck, HeartPulse, FlaskConical, Filter } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [staff, setStaff] = useState([]);
    const [emergencyAlerts, setEmergencyAlerts] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(false);

    // Quick Webhook Message Simulator State
    const [simPhone, setSimPhone] = useState('918233816674');
    const [simMessage, setSimMessage] = useState('');
    const [simSending, setSimSending] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, bookingsRes, messagesRes, staffRes, emergencyRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/bookings'),
                fetch('/api/messages'),
                fetch('/api/staff'),
                fetch('/api/emergency')
            ]);

            const statsData = await statsRes.json();
            const bookingsData = await bookingsRes.json();
            const messagesData = await messagesRes.json();
            const staffData = await staffRes.json();
            const emergencyData = await emergencyRes.json();

            setStats(statsData.stats);
            setBookings(bookingsData.bookings || []);
            setMessages(messagesData.messages || []);
            setStaff(staffData.staff || []);
            setEmergencyAlerts(emergencyData.alerts || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 4000); // Live poll every 4s
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (bookingId, newStatus, staffId = null) => {
        try {
            await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, staffId })
            });
            fetchData();
        } catch (err) {
            console.error('Status update failed:', err);
        }
    };

    const handleSendTestWebhook = async (textToSend) => {
        const text = textToSend || simMessage;
        if (!text) return;
        setSimSending(true);
        try {
            await fetch('/api/simulate-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: simPhone,
                    message: text
                })
            });
            setSimMessage('');
            fetchData();
        } catch (err) {
            console.error('Webhook simulation failed:', err);
        } finally {
            setSimSending(false);
        }
    };

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Health Saathi Chatbot
                            <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-teal-200">
                                by AutomateX.co.in
                            </span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                            Live Patient WhatsApp Messages • Automated Flow • Staff Assignment • Medical Bookings
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchData}
                        className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition"
                    >
                        <RefreshCw className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Live Data</span>
                    </button>
                </div>
            </div>

            {/* Emergency Escalation Alert Banner */}
            {emergencyAlerts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                        <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="flex-1">
                            <h3 className="text-rose-900 font-bold text-sm flex items-center justify-between">
                                <span>🚨 CLINICAL EMERGENCY ALERTS ({emergencyAlerts.length})</span>
                                <span className="text-xs bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-mono font-semibold">
                                    108 Advisory Triggered
                                </span>
                            </h3>
                            <div className="mt-2 space-y-2">
                                {emergencyAlerts.map(alert => (
                                    <div key={alert.id} className="bg-white p-3 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                        <div>
                                            <span className="font-bold text-slate-900">{alert.patientName}</span>
                                            <span className="text-slate-500 ml-2 font-mono">{alert.phone}</span>
                                            <span className="text-rose-700 font-medium ml-2 bg-rose-100 px-2 py-0.5 rounded">
                                                Triggered: "{alert.triggerKeyword}"
                                            </span>
                                        </div>
                                        <a
                                            href={`tel:${alert.phone}`}
                                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition shrink-0"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>Call Patient Immediately</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric KPI Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-teal-300 transition">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <span>WhatsApp Enquiries</span>
                            <MessageSquare className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalEnquiries}</div>
                        <div className="text-xs text-teal-600 font-medium mt-1">Live Messages Received</div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-teal-300 transition">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <span>Total Patient Bookings</span>
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.todaysBookings}</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">Confirmed Patients</div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-amber-300 transition">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <span>Pending Staff</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-3xl font-extrabold text-amber-600 mt-2">{stats.pendingAssignment}</div>
                        <div className="text-xs text-amber-700 font-medium mt-1">Awaiting Allocation</div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-300 transition">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <span>Service Revenue</span>
                            <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 mt-2">₹{stats.totalRevenue}</div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">Total Healthcare Volume</div>
                    </div>
                </div>
            )}

            {/* Main Content Layout: Live WhatsApp Inbox (Left) + Medical Bookings Pipeline (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LIVE WHATSAPP MESSAGES FEED & TEST SIMULATOR */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-[680px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="w-5 h-5 text-teal-600" />
                            <h2 className="font-bold text-slate-900 text-base">Live WhatsApp Messages Feed</h2>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Auto-Replied (WhatsApp API)
                        </span>
                    </div>

                    {/* Quick Trigger Preset Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-slate-400 font-semibold shrink-0">Simulate:</span>
                        <button
                            onClick={() => handleSendTestWebhook('hi')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 font-medium"
                        >
                            👋 Send "Hi"
                        </button>
                        <button
                            onClick={() => handleSendTestWebhook('3')}
                            className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-200 shrink-0 font-medium"
                        >
                            🏥 Book Physio
                        </button>
                        <button
                            onClick={() => handleSendTestWebhook('Severe chest pain')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 shrink-0 font-medium"
                        >
                            🚨 Emergency
                        </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {messages.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-sm space-y-2">
                                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="font-semibold text-slate-600">No Live WhatsApp Messages Yet</p>
                                <p className="text-xs text-slate-400">Send a WhatsApp message from your phone to see live conversations here.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs hover:border-teal-300 transition">
                                    {/* Incoming Patient Message */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-slate-900 text-sm">{msg.senderName}</span>
                                            <span className="text-[11px] text-slate-400 font-mono">({msg.phone})</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-medium text-slate-800 text-xs">
                                        📩 Patient: "{msg.userMessage}"
                                    </div>

                                    {/* Bot Auto Reply */}
                                    <div className="bg-teal-50/80 p-2.5 rounded-lg border border-teal-200 text-teal-900 text-[11px] whitespace-pre-line leading-relaxed">
                                        <div className="font-semibold text-teal-800 flex items-center justify-between mb-1">
                                            <span>🤖 Health Saathi Bot (Auto-Reply):</span>
                                            <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                                        </div>
                                        {msg.botReplyText}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Send Custom Webhook Message Box */}
                    <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                        <input
                            type="text"
                            value={simMessage}
                            onChange={(e) => setSimMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendTestWebhook()}
                            placeholder="Type test patient message (e.g. 'book nurse')..."
                            className="flex-1 bg-slate-50 text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 focus:bg-white"
                        />
                        <button
                            onClick={() => handleSendTestWebhook()}
                            disabled={simSending}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 shrink-0"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{simSending ? 'Sending...' : 'Send'}</span>
                        </button>
                    </div>
                </div>

                {/* MEDICAL BOOKINGS MANAGEMENT PIPELINE */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-[680px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-900 text-base">Patient Bookings & Allocation Pipeline</h2>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto text-xs">
                            {['ALL', 'Pending Assignment', 'Assigned', 'On the way', 'Completed'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${filterStatus === st
                                            ? 'bg-teal-600 text-white shadow-sm'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="text-[11px] font-bold uppercase bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0">
                                <tr>
                                    <th className="p-3">Booking ID</th>
                                    <th className="p-3">Service & Patient</th>
                                    <th className="p-3">Date & Slot</th>
                                    <th className="p-3">Assigned Staff</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">PDF Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-400">
                                            No bookings match the selected status filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50 transition">
                                            <td className="p-3 font-mono font-bold text-teal-700">{b.id}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-900">{b.serviceName}</div>
                                                <div className="text-[11px] text-slate-500">{b.patientName} ({b.phone})</div>
                                                <div className="text-[10px] text-slate-400">Pincode: {b.pincode}</div>
                                            </td>
                                            <td className="p-3 text-[11px]">
                                                <div className="font-semibold text-slate-800">{b.date}</div>
                                                <div className="text-teal-600 font-mono font-bold">{b.slot}</div>
                                            </td>
                                            <td className="p-3 text-[11px]">
                                                {b.assignedStaff ? (
                                                    <div>
                                                        <div className="font-bold text-emerald-700">{b.assignedStaff.name}</div>
                                                        <div className="text-[10px] text-slate-400">{b.assignedStaff.phone}</div>
                                                    </div>
                                                ) : (
                                                    <select
                                                        onChange={(e) => handleUpdateStatus(b.id, 'Assigned', e.target.value)}
                                                        defaultValue=""
                                                        className="bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300 rounded-lg px-2 py-1 focus:outline-none"
                                                    >
                                                        <option value="" disabled>Assign Staff...</option>
                                                        {staff.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                                                    className="bg-white border border-slate-300 text-slate-800 font-semibold text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                                                >
                                                    <option value="Pending Assignment">Pending Assignment</option>
                                                    <option value="Assigned">Assigned</option>
                                                    <option value="On the way">On the way</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-right">
                                                <a
                                                    href={`/api/bookings/${b.id}/invoice`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-teal-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 transition"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    <span>PDF</span>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* STAFF DIRECTORY ROSTER & META WEBHOOK INFO (CLEAN WHITE CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staff Roster */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-teal-600" />
                            Verified Healthcare Staff Roster
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
                            {staff.length} Active
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {staff.map(s => (
                            <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                                <div className="font-bold text-slate-900">{s.name}</div>
                                <div className="text-[11px] text-teal-700 font-semibold">{s.role}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{s.phone} • Coverage: {s.location}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meta Webhook Technical Spec */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-teal-600" />
                            WhatsApp Cloud API Webhook Listener
                        </h3>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            Active Listener
                        </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                            <span className="text-slate-400">Live Webhook Endpoint:</span>
                            <div className="text-teal-700 font-bold break-all">https://garments-erp-bot.onrender.com/api/webhook</div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <span className="text-slate-400">Verify Token:</span>
                            <div className="text-slate-900 font-bold">automatex_copilot_token</div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <span className="text-slate-400">Active Bot WABA Number:</span>
                            <div className="text-emerald-700 font-bold">+91 74250 16636 (Digify_soft)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
