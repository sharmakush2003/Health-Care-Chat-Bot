import React from 'react';
import { Server, Code, ShieldCheck, CheckCircle2, Terminal, ExternalLink, Zap } from 'lucide-react';

export default function ArchitectureDoc() {
    return (
        <div className="space-y-6 font-sans">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    Meta WhatsApp Cloud API Architecture & Setup Guide
                    <span className="bg-teal-500/20 text-teal-400 text-xs px-2.5 py-1 rounded-full font-mono border border-teal-500/30">Garments ERP Architecture Port</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Technical guide for connecting Meta Developer Portal to `/api/webhook` for live production WhatsApp numbers.
                </p>
            </div>

            {/* Step by Step Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                        <Server className="w-5 h-5 text-teal-400" />
                        1. Webhook Configuration (Meta Dashboard)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        In your Meta App Dashboard under <strong>WhatsApp → Configuration → Edit Webhook</strong>, provide the following parameters:
                    </p>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-xl font-mono text-xs border border-slate-800">
                        <div>
                            <span className="text-slate-500">Callback URL:</span>
                            <div className="text-teal-300 font-semibold break-all">https://your-domain.com/api/webhook</div>
                        </div>
                        <div className="pt-2 border-t border-slate-900">
                            <span className="text-slate-500">Verify Token:</span>
                            <div className="text-amber-300 font-semibold">automatex_healthcare_token</div>
                        </div>
                        <div className="pt-2 border-t border-slate-900">
                            <span className="text-slate-500">Subscribed Fields:</span>
                            <div className="text-emerald-300 font-semibold">messages, message_deliveries</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                        <Code className="w-5 h-5 text-teal-400" />
                        2. Environment Variables (.env)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        To enable outbound WhatsApp messages to actual patient phone numbers via Meta Cloud API:
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto leading-relaxed">
                        {`PORT=3000
META_VERIFY_TOKEN=automatex_healthcare_token
META_ACCESS_TOKEN=EAAG... (From Meta Dashboard)
META_WABA_ID=1029384756 (WhatsApp Business ID)`}
                    </pre>
                </div>
            </div>

            {/* Architecture Flow Diagram Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    AutomateX End-to-End Pipeline Architecture
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-teal-400 font-bold">1. WhatsApp User</div>
                        <div className="text-slate-500 mt-1">Text / List Reply</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-amber-400 font-bold">2. Meta Cloud API</div>
                        <div className="text-slate-500 mt-1">Webhook Delivery</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-emerald-400 font-bold">3. Healthcare Engine</div>
                        <div className="text-slate-500 mt-1">State Machine & 108 Emergency Check</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-indigo-400 font-bold">4. ERP Database</div>
                        <div className="text-slate-500 mt-1">Bookings & Staff Assignment</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-purple-400 font-bold">5. PDF & WhatsApp Outbound</div>
                        <div className="text-slate-500 mt-1">Confirmation & Receipt</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
