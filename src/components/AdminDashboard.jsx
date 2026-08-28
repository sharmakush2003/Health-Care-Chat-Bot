import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, AlertTriangle, CheckCircle, Clock, Truck, ShieldAlert, FileText, Download, Phone, RefreshCw, MessageSquare, Send, CheckCheck, Sparkles, Stethoscope, UserCheck, HeartPulse, FlaskConical, Filter, Zap, ArrowUpRight } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
            {/* STUNNING BRANDING HEADER BAR */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center space-x-4 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20 ring-4 ring-teal-500/20">
                        <Stethoscope className="w-7 h-7 text-slate-950" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Health Saathi Chatbot
                            </h1>
                            <span className="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full font-bold border border-teal-500/30 backdrop-blur-md">
                                by AutomateX.co.in
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Live Sync Active
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
                            <span>Real-Time Patient WhatsApp Feed</span> • <span>Doctor-Guided Home Healthcare</span> • <span>Automated Staff Allocation</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 z-10">
                    <button
                        onClick={fetchData}
                        className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm hover:border-teal-500/50 active:scale-95"
                    >
                        <RefreshCw className={`w-4 h-4 text-teal-400 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Live Data</span>
                    </button>
                </div>
            </div>

            {/* Emergency Escalation Alert Banner */}
            {emergencyAlerts.length > 0 && (
                <div className="bg-rose-950/60 border border-rose-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
                    <div className="flex items-start space-x-3">
                        <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                        <div className="flex-1">
                            <h3 className="text-rose-200 font-bold text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    🚨 CLINICAL EMERGENCY ALERTS ({emergencyAlerts.length})
                                </span>
                                <span className="text-xs bg-rose-900/80 text-rose-300 px-2.5 py-0.5 rounded font-mono font-bold border border-rose-700">
                                    108 Advisory Triggered
                                </span>
                            </h3>
                            <div className="mt-3 space-y-2">
                                {emergencyAlerts.map(alert => (
                                    <div key={alert.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-800/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                                        <div>
                                            <span className="font-bold text-white text-sm">{alert.patientName}</span>
                                            <span className="text-slate-400 ml-2 font-mono">({alert.phone})</span>
                                            <span className="text-rose-400 font-semibold ml-2 bg-rose-950 px-2.5 py-0.5 rounded-lg border border-rose-800/60">
                                                Triggered: "{alert.triggerKeyword}"
                                            </span>
                                        </div>
                                        <a
                                            href={`tel:${alert.phone}`}
                                            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition shrink-0 shadow-lg shadow-rose-600/30"
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
                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden group hover:border-teal-500/50 transition-all">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <span>WhatsApp Enquiries</span>
                            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white mt-3">{stats.totalEnquiries}</div>
                        <div className="text-xs text-teal-400 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span> Real Patient Messages
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <span>Total Patient Bookings</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white mt-3">{stats.todaysBookings}</div>
                        <div className="text-xs text-blue-400 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Confirmed Patient Visits
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <span>Pending Staff</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-3">{stats.pendingAssignment}</div>
                        <div className="text-xs text-amber-400/90 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Awaiting Allocation
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <span>Service Revenue</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-3">₹{stats.totalRevenue}</div>
                        <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Booking Volume
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Layout: Live WhatsApp Inbox (Left) + Medical Bookings Pipeline (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LIVE WHATSAPP MESSAGES FEED & TEST SIMULATOR */}
                <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col h-[700px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <h2 className="font-extrabold text-white text-base">Live WhatsApp Feed</h2>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Auto-Replied (WhatsApp API)
                        </span>
                    </div>

                    {/* Quick Trigger Preset Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                        <span className="text-slate-400 font-semibold shrink-0 text-[11px]">Quick Test:</span>
                        <button
                            onClick={() => handleSendTestWebhook('hi')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-xl border border-slate-700 shrink-0 font-medium text-xs transition"
                        >
                            👋 Send "Hi"
                        </button>
                        <button
                            onClick={() => handleSendTestWebhook('3')}
                            className="bg-teal-950 hover:bg-teal-900 text-teal-300 px-3 py-1 rounded-xl border border-teal-800/80 shrink-0 font-medium text-xs transition"
                        >
                            🏥 Book Physio
                        </button>
                        <button
                            onClick={() => handleSendTestWebhook('Severe chest pain')}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-300 px-3 py-1 rounded-xl border border-rose-800/80 shrink-0 font-medium text-xs transition"
                        >
                            🚨 Emergency
                        </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                                <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 border border-slate-700 animate-pulse">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">No Live Messages Yet</h4>
                                    <p className="text-slate-400 text-xs mt-1 max-w-xs">
                                        Send a WhatsApp message from your phone or click "Send Hi" above to see live real-time conversations!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5 text-xs hover:border-teal-500/40 transition-all shadow-md">
                                    {/* Incoming Patient Message Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-teal-600/30 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/40">
                                                {msg.senderName ? msg.senderName.charAt(0) : 'P'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white text-sm">{msg.senderName}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{msg.timestamp}</span>
                                    </div>

                                    {/* Patient Message Bubble */}
                                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-semibold text-slate-200 text-xs">
                                        📩 <span className="text-slate-400 font-normal">Patient:</span> "{msg.userMessage}"
                                    </div>

                                    {/* Bot Auto Reply Bubble */}
                                    <div className="bg-teal-950/60 p-3.5 rounded-xl border border-teal-800/60 text-teal-100 text-xs whitespace-pre-line leading-relaxed font-sans shadow-inner">
                                        <div className="font-bold text-teal-300 flex items-center justify-between mb-1.5 text-[11px] border-b border-teal-800/40 pb-1">
                                            <span className="flex items-center gap-1.5">
                                                🤖 Health Saathi Bot (Auto-Reply):
                                            </span>
                                            <CheckCheck className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        {msg.botReplyText}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Send Custom Webhook Message Box */}
                    <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                        <input
                            type="text"
                            value={simMessage}
                            onChange={(e) => setSimMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendTestWebhook()}
                            placeholder="Type test message (e.g. 'hi', '1', 'chest pain')..."
                            className="flex-1 bg-slate-950 text-white placeholder-slate-500 text-xs px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-teal-500"
                        />
                        <button
                            onClick={() => handleSendTestWebhook()}
                            disabled={simSending}
                            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded-2xl font-bold text-xs transition flex items-center space-x-1.5 shrink-0 shadow-lg shadow-teal-600/30"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{simSending ? 'Sending...' : 'Send'}</span>
                        </button>
                    </div>
                </div>

                {/* MEDICAL BOOKINGS MANAGEMENT PIPELINE */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col h-[700px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <h2 className="font-extrabold text-white text-base">Patient Bookings & Allocation Pipeline</h2>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto text-xs">
                            {['ALL', 'Pending Assignment', 'Assigned', 'On the way', 'Completed'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap text-xs ${filterStatus === st
                                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                        }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl custom-scrollbar bg-slate-950/60">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="text-[11px] font-extrabold uppercase bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="p-3.5">Booking ID</th>
                                    <th className="p-3.5">Service & Patient</th>
                                    <th className="p-3.5">Date & Slot</th>
                                    <th className="p-3.5">Assigned Staff</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">PDF Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Calendar className="w-8 h-8 text-slate-700" />
                                                <p className="font-semibold text-slate-400 text-sm">No Live Patient Bookings Yet</p>
                                                <p className="text-xs text-slate-500 max-w-sm">
                                                    When a patient completes a booking on WhatsApp, it will automatically populate here in real time.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-900/80 transition">
                                            <td className="p-3.5 font-mono font-bold text-teal-400">{b.id}</td>
                                            <td className="p-3.5">
                                                <div className="font-bold text-white">{b.serviceName}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">{b.patientName} ({b.phone})</div>
                                                <div className="text-[10px] text-slate-500 font-mono">Pincode: {b.pincode}</div>
                                            </td>
                                            <td className="p-3.5 text-[11px]">
                                                <div className="font-bold text-slate-200">{b.date}</div>
                                                <div className="text-teal-400 font-mono font-bold">{b.slot}</div>
                                            </td>
                                            <td className="p-3.5 text-[11px]">
                                                {b.assignedStaff ? (
                                                    <div>
                                                        <div className="font-bold text-emerald-400">{b.assignedStaff.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono">{b.assignedStaff.phone}</div>
                                                    </div>
                                                ) : (
                                                    <select
                                                        onChange={(e) => handleUpdateStatus(b.id, 'Assigned', e.target.value)}
                                                        defaultValue=""
                                                        className="bg-amber-950/80 text-amber-300 text-[11px] font-bold border border-amber-800 rounded-xl px-2.5 py-1 focus:outline-none"
                                                    >
                                                        <option value="" disabled>Assign Staff...</option>
                                                        {staff.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                                                    className="bg-slate-900 border border-slate-700 text-white font-bold text-[11px] rounded-xl px-2.5 py-1 focus:outline-none focus:border-teal-500"
                                                >
                                                    <option value="Pending Assignment">Pending Assignment</option>
                                                    <option value="Assigned">Assigned</option>
                                                    <option value="On the way">On the way</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <a
                                                    href={`/api/bookings/${b.id}/invoice`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center space-x-1.5 bg-teal-950 hover:bg-teal-900 text-teal-300 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-teal-800 transition shadow-sm"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
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

            {/* STAFF DIRECTORY ROSTER & META WEBHOOK INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staff Roster */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-teal-400" />
                            Verified Healthcare Staff Roster
                        </h3>
                        <span className="text-xs bg-slate-800 text-teal-300 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
                            {staff.length} Active
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {staff.map(s => (
                            <div key={s.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1 text-xs">
                                <div className="font-bold text-white">{s.name}</div>
                                <div className="text-[11px] text-teal-400 font-semibold">{s.role}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{s.phone} • Coverage: {s.location}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meta Webhook Technical Spec */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-teal-400" />
                            WhatsApp Cloud API Webhook Listener
                        </h3>
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Active Gateway
                        </span>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                        <div>
                            <span className="text-slate-500">Live Webhook Endpoint:</span>
                            <div className="text-teal-400 font-bold break-all mt-0.5">https://garments-erp-bot.onrender.com/api/webhook</div>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-slate-500">Verify Token:</span>
                            <div className="text-white font-bold mt-0.5">automatex_copilot_token</div>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-slate-500">Active Bot WABA Number:</span>
                            <div className="text-emerald-400 font-bold mt-0.5">+91 74250 16636 (Digify_soft)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
