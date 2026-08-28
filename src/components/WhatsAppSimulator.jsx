import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, CheckCheck, AlertTriangle, FileText, Download, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function WhatsAppSimulator({ onBookingCreated }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Welcome Message
    useEffect(() => {
        handleSendMessage('hi');
    }, []);

    const handleSendMessage = async (textToSend, payload = null) => {
        const text = textToSend || inputText;
        if (!text && !payload) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text || 'Selected option',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setLoading(true);

        try {
            const res = await fetch('/api/simulate-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: '+91 90450 99111',
                    message: text,
                    payload
                })
            });

            const data = await res.json();
            setLoading(false);

            if (data && data.botReply) {
                const botReply = data.botReply;
                const botMsg = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: botReply.type,
                    text: botReply.text,
                    buttons: botReply.buttons,
                    listTitle: botReply.listTitle,
                    sections: botReply.sections,
                    bookingId: botReply.bookingId,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMsg]);

                if (onBookingCreated && botReply.type === 'BOOKING_CONFIRMED') {
                    onBookingCreated();
                }
            }
        } catch (err) {
            setLoading(false);
            console.error('Chat simulation error:', err);
        }
    };

    return (
        <div className="flex flex-col h-[750px] max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 font-sans">
            {/* WhatsApp Header */}
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700 text-white">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white shadow-md">
                            HS
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                            Health Saathi Chatbot
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">Verified</span>
                        </h3>
                        <p className="text-[11px] text-teal-400">by AutomateX.co.in</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                    <button onClick={() => { setMessages([]); handleSendMessage('hi'); }} className="p-1 hover:text-white transition" title="Restart Chat">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                    <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
            </div>

            {/* Quick Test Action Chips */}
            <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin text-xs">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Quick Tests:
                </span>
                <button
                    onClick={() => handleSendMessage('3')}
                    className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30 shrink-0 text-[11px]"
                >
                    🏥 Book Physio
                </button>
                <button
                    onClick={() => handleSendMessage('1')}
                    className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30 shrink-0 text-[11px]"
                >
                    🩺 Book Nurse
                </button>
                <button
                    onClick={() => handleSendMessage('5')}
                    className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30 shrink-0 text-[11px]"
                >
                    ⚡ Book ECG
                </button>
                <button
                    onClick={() => handleSendMessage('Severe chest pain emergency')}
                    className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/40 shrink-0 text-[11px] font-medium"
                >
                    🚨 Emergency Test
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/80 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md text-sm ${msg.sender === 'user'
                                    ? 'bg-teal-700 text-white rounded-tr-none'
                                    : msg.type === 'EMERGENCY_ALERT'
                                        ? 'bg-rose-950/90 text-rose-100 border border-rose-500/50 rounded-tl-none'
                                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                                }`}
                        >
                            {/* Formatted Text Body */}
                            <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                                {msg.text}
                            </div>

                            {/* Render Interactive List Rows */}
                            {msg.sections && (
                                <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-2">
                                    <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                                        {msg.listTitle || 'Select an Option'}
                                    </div>
                                    {msg.sections.map((sec, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            {sec.rows.map(row => (
                                                <button
                                                    key={row.id}
                                                    onClick={() => handleSendMessage(row.title, row.id)}
                                                    className="w-full text-left bg-slate-900/80 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 p-2 rounded-xl transition group"
                                                >
                                                    <div className="font-semibold text-xs text-slate-200 group-hover:text-teal-300">
                                                        {row.title}
                                                    </div>
                                                    {row.description && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {row.description}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Render Interactive Buttons */}
                            {msg.buttons && (
                                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-700/60 pt-2">
                                    {msg.buttons.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => handleSendMessage(b.text, b.id)}
                                            className="flex-1 min-w-[120px] bg-teal-900/40 hover:bg-teal-800/60 border border-teal-500/40 text-teal-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center transition"
                                        >
                                            {b.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* PDF Invoice Download Card */}
                            {msg.bookingId && (
                                <div className="mt-3 p-2.5 bg-slate-900/90 border border-teal-500/40 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-5 h-5 text-teal-400" />
                                        <div>
                                            <div className="text-xs font-semibold text-white">Invoice_{msg.bookingId}.pdf</div>
                                            <div className="text-[10px] text-slate-400">AutomateX PDF Receipt</div>
                                        </div>
                                    </div>
                                    <a
                                        href={`/api/bookings/${msg.bookingId}/invoice`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-teal-600 hover:bg-teal-500 text-white p-1.5 rounded-lg transition"
                                        title="Download Invoice PDF"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center justify-end space-x-1 mt-1">
                                <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                                {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-teal-300" />}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-300 text-xs rounded-2xl px-4 py-2 flex items-center space-x-2 border border-slate-700">
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></span>
                            <span>AutomateX Engine is typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type message or 'menu' / 'chest pain'..."
                    className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 rounded-full border border-slate-800 focus:outline-none focus:border-teal-500"
                />
                <button
                    onClick={() => handleSendMessage()}
                    className="bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-full transition shadow-md shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
