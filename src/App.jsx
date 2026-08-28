import React from 'react';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
            <AdminDashboard />
        </div>
    );
}
