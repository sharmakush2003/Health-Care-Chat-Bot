import React, { useState, useEffect } from 'react';
import { UserCheck, Star, Phone, MapPin, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        fetch('/api/staff')
            .then(res => res.json())
            .then(data => setStaff(data.staff || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6 font-sans">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    Verified Healthcare Staff Directory
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-mono border border-emerald-500/30">Active Roster</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Certified Nurses, Caretakers, Physiotherapists, Lab Technicians & ECG Specialists for Home Visits
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                    <div key={member.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-lg">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-100 text-sm">{member.name}</h3>
                                    <div className="text-xs text-teal-400 font-medium">{member.role}</div>
                                </div>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-mono">
                                <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center space-x-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{member.phone}</span>
                                </span>
                                <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>{member.rating}</span>
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span>Pincode Coverage: <strong className="text-slate-300 font-mono">{member.location}</strong></span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Available for Dispatch
                            </span>
                            <button className="bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition font-medium">
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
