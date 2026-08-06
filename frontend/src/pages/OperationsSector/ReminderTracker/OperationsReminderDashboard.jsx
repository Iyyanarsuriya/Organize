import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaGoogle, FaTimes } from 'react-icons/fa';
import { IoArrowBack } from "react-icons/io5";
import { getReminders } from '../../../api/Reminder/opsReminder';
import { getGoogleAuthUrl, disconnectGoogle } from '../../../api/authApi';

import toast from 'react-hot-toast';
import { exportReminderToCSV, exportReminderToTXT, exportReminderToPDF } from '../../../utils/exportUtils/index.js';
import ExportButtons from '../../../components/Common/ExportButtons';
import ReminderList from '../../../components/Common/ReminderList';

const MfgReminderDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [viewModalType, setViewModalType] = useState(null); // 'total', 'completed', 'remaining'

    // Filter State
    const [periodType, setPeriodType] = useState('all'); // 'all', 'today', 'range'
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'

    const lastFetchRef = useRef(0);

    const fetchData = async (force = false) => {
        const now = Date.now();
        // Throttle fetching (60s cache/throttle)
        if (!force && now - lastFetchRef.current < 60000 && !loading) {
            return;
        }

        if (force) {
            window._mfgDashboardFetchPromise = null;
        }

        // Request Deduplication
        if (!force && window._mfgDashboardFetchPromise) {
            try {
                const res = await window._mfgDashboardFetchPromise;
                setReminders(res.data || []);
                lastFetchRef.current = Date.now();
            } catch (error) {
                console.error("Error joining existing fetch:", error);
            } finally {
                setLoading(false);
            }
            return;
        }

        const fetchPromise = getReminders({ sector: 'operations' });

        if (!force) {
            window._mfgDashboardFetchPromise = fetchPromise;
        }

        try {
            const res = await fetchPromise;
            setReminders(res.data || []);
            lastFetchRef.current = Date.now();
        } catch (error) {
            console.error("Error fetching reminders", error);
            toast.error("Failed to load data");
        } finally {
            if (!force) window._mfgDashboardFetchPromise = null;
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const processedReminders = useMemo(() => {
        return reminders.filter(r => {
            // Period Filter
            if (periodType === 'today') {
                const today = new Date().toISOString().split('T')[0];
                if (!r.due_date || !r.due_date.startsWith(today)) return false;
            } else if (periodType === 'range') {
                if (!r.due_date) return false;
                const rDate = r.due_date.split('T')[0];
                if (customRange.start && rDate < customRange.start) return false;
                if (customRange.end && rDate > customRange.end) return false;
            }

            // Status Filter
            if (filterStatus !== 'all') {
                const isCompleted = filterStatus === 'completed';
                // Convert to boolean for comparison (handles 1/0 from DB)
                if (Boolean(r.is_completed) !== isCompleted) return false;
            }

            return true;
        });
    }, [reminders, periodType, customRange, filterStatus]);

    // Statistics
    const stats = useMemo(() => {
        const total = processedReminders.length;
        const completed = processedReminders.filter(r => Boolean(r.is_completed)).length;
        const remaining = total - completed;
        return { total, completed, remaining };
    }, [processedReminders]);

    const handleConnectCalendar = async () => {
        try {
            const res = await getGoogleAuthUrl();
            if (res.data?.url) {
                // Redirect user to google oauth consent screen
                window.location.href = res.data.url;
            } else {
                toast.error("OAuth Link Generation failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Google Integration failed");
        }
    };

    const handleDisconnectCalendar = () => {
        setShowDisconnectModal(true);
    };

    const confirmDisconnect = async () => {
        try {
            await disconnectGoogle();
            setUser(prev => {
                const updated = { ...prev, is_google_connected: false };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
            });
            toast.success("Disconnected successfully");
        } catch (error) {
            toast.error("Failed to disconnect calendar");
        } finally {
            setShowDisconnectModal(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const exportPeriod = periodType === 'range' ? `${customRange.start}_to_${customRange.end}` : periodType;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-[16px] sm:p-[28px] md:p-[40px] font-['Outfit'] pb-[80px] sm:pb-[100px]">
            <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-[20px] sm:gap-[32px]">

                {/* Header Row */}
                <div className="flex items-center gap-[12px] sm:gap-[16px]">
                    <button
                        onClick={() => navigate('/operations/reminders')}
                        className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] bg-white border border-slate-200 rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
                    >
                        <IoArrowBack className="text-[16px] sm:text-[20px]" />
                    </button>
                    <div>
                        <h1 className="text-[20px] sm:text-[28px] md:text-[32px] font-black text-slate-800 tracking-tight leading-none flex items-center gap-[10px]">
                            Reminder Analytics
                        </h1>
                        <p className="text-slate-500 mt-[4px] text-[11px] sm:text-[14px] font-medium leading-none">View summary, export data, and connect calendar</p>
                    </div>
                </div>

                {/* Filter and Export Bar */}
                <div className="bg-white rounded-[24px] p-[16px] sm:p-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-[24px]">
                    <div className="flex flex-wrap items-center gap-[16px] w-full md:w-auto">

                        {/* Period Filter */}
                        <div className="flex items-center gap-[8px] bg-slate-50 border border-slate-200 px-[12px] py-[8px] rounded-[12px]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Period:</span>
                            <select
                                value={periodType}
                                onChange={(e) => setPeriodType(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer uppercase tracking-wider"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="range">Range</option>
                            </select>
                        </div>

                        {/* Date Range Inputs */}
                        {periodType === 'range' && (
                            <div className="flex items-center gap-[8px] bg-slate-50 border border-slate-200 px-[12px] py-[8px] rounded-[12px] animate-in fade-in zoom-in-95 duration-200">
                                <input
                                    type="date"
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                    className="bg-transparent text-[10px] font-bold text-slate-600 outline-none w-[90px]"
                                />
                                <span className="text-slate-400 font-bold">-</span>
                                <input
                                    type="date"
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                    className="bg-transparent text-[10px] font-bold text-slate-600 outline-none w-[90px]"
                                />
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="flex items-center gap-[8px] bg-slate-50 border border-slate-200 px-[12px] py-[8px] rounded-[12px]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Status:</span>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer uppercase tracking-wider"
                            >
                                <option value="all">All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Actions */}
                    <div className="flex items-center gap-[16px]">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:inline">Export Report</span>
                        <div className="h-[32px] w-px bg-slate-100 hidden sm:block"></div>
                        <ExportButtons
                            onExportCSV={() => exportReminderToCSV({ data: processedReminders, period: exportPeriod, filename: `mfg_reminders_report_${new Date().toISOString().split('T')[0]}` })}
                            onExportPDF={() => exportReminderToPDF({ data: processedReminders, period: exportPeriod, filename: `mfg_reminders_report_${new Date().toISOString().split('T')[0]}` })}
                            onExportTXT={() => exportReminderToTXT({ data: processedReminders, period: exportPeriod, filename: `mfg_reminders_report_${new Date().toISOString().split('T')[0]}` })}
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                    {/* Total Tasks */}
                    <div
                        onClick={() => setViewModalType('total')}
                        className="bg-white rounded-[32px] p-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300 cursor-pointer group hover:ring-2 hover:ring-[#6366f1]/20"
                    >
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-[16px] group-hover:text-[#6366f1] transition-colors">Total Tasks</h3>
                        <div className="text-6xl font-black text-[#6366f1] drop-shadow-sm">{stats.total}</div>
                        {periodType !== 'all' && <span className="text-[10px] font-bold text-slate-300 mt-[8px] uppercase tracking-wide">Filtered</span>}
                        <p className="text-[10px] text-slate-300 mt-[8px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Click to view</p>
                    </div>

                    {/* Completed */}
                    <div
                        onClick={() => setViewModalType('completed')}
                        className="bg-white rounded-[32px] p-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300 cursor-pointer group hover:ring-2 hover:ring-[#00d1a0]/20"
                    >
                        <h3 className="text-xs font-black uppercase tracking-widest mb-[16px] text-[#00d1a0]/80 group-hover:text-[#00d1a0] transition-colors">Completed</h3>
                        <div className="text-6xl font-black text-[#00d1a0] drop-shadow-sm">{stats.completed}</div>
                        <p className="text-[10px] text-slate-300 mt-[8px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Click to view</p>
                    </div>

                    {/* Remaining */}
                    <div
                        onClick={() => setViewModalType('remaining')}
                        className="bg-white rounded-[32px] p-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300 cursor-pointer group hover:ring-2 hover:ring-orange-400/20"
                    >
                        <h3 className="text-xs font-black uppercase tracking-widest mb-[16px] text-orange-400 group-hover:text-orange-500 transition-colors">Remaining</h3>
                        <div className="text-6xl font-black text-orange-400 drop-shadow-sm">{stats.remaining}</div>
                        <p className="text-[10px] text-slate-300 mt-[8px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Click to view</p>
                    </div>
                </div>

                {/* Google Calendar Section */}
                <div className="bg-white rounded-[32px] p-[16px] sm:p-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-[24px]">
                    <div className="flex items-center gap-[24px]">
                        <div className="w-[64px] h-[64px] rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center shrink-0">
                            <FaGoogle className="text-3xl text-blue-500" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-lg font-black text-slate-800">Google Calendar</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Not Connected</p>
                        </div>
                    </div>
                    <button
                        onClick={handleConnectCalendar}
                        className="px-[32px] py-[16px] bg-[#6366f1] hover:bg-blue-600 text-white rounded-[16px] font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-[8px]"
                    >
                        <FaCalendarAlt />
                        Connect Calendar
                    </button>
                </div>

                <div className="text-center pt-[32px] pb-[16px]">
                    <p className="text-[10px] font-black text-slate-400/50 uppercase tracking-[0.2em]">Link your calendar to get automatic notifications & event sync</p>
                </div>

                {/* Account Settings Header */}
                <div className="flex items-center gap-[12px] mb-[8px]">
                    <div className="p-[8px] bg-slate-100 rounded-[8px] text-slate-400">
                        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Account Settings</h3>
                </div>

                {/* Session / Logout */}
                <div className="bg-white rounded-[32px] p-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-[24px]">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-black text-slate-800">Session</h3>
                        <p className="text-xs font-medium text-slate-500">Log out of your current session</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-[32px] py-[12px] bg-white text-red-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-[16px] font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                        Logout
                    </button>
                </div>

            </div>

            {/* Generic Task View Modal */}
            {viewModalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setViewModalType(null)}>
                    <div className="bg-white rounded-[32px] p-[24px] w-full max-w-[672px] shadow-2xl animate-in zoom-in-95 duration-200 border border-white h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {(() => {
                            const getContent = () => {
                                switch (viewModalType) {
                                    case 'total':
                                        return { title: 'Total Tasks', data: processedReminders, color: 'text-[#6366f1]', bg: 'bg-indigo-50' };
                                    case 'completed':
                                        return { title: 'Completed Tasks', data: processedReminders.filter(r => Boolean(r.is_completed)), color: 'text-[#00d1a0]', bg: 'bg-emerald-50' };
                                    case 'remaining':
                                        return { title: 'Remaining Tasks', data: processedReminders.filter(r => !Boolean(r.is_completed)), color: 'text-orange-400', bg: 'bg-orange-50' };
                                    default:
                                        return { title: 'Tasks', data: [], color: 'text-slate-800', bg: 'bg-slate-50' };
                                }
                            };
                            const { title, data, color, bg } = getContent();

                            return (
                                <>
                                    <div className="flex justify-between items-center mb-[24px] px-[8px]">
                                        <div className="flex items-center gap-[12px]">
                                            <div className={`w-[40px] h-[40px] rounded-full ${bg} flex items-center justify-center ${color}`}>
                                                <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{title}</h3>
                                        </div>
                                        <button
                                            onClick={() => setViewModalType(null)}
                                            className="w-[40px] h-[40px] rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors cursor-pointer"
                                        >
                                            <FaTimes className="w-[16px] h-[16px]" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar px-[8px] pb-[16px]">
                                        {data.length > 0 ? (
                                            <ReminderList
                                                reminders={data}
                                                isSelectionMode={false}
                                                readOnly={true}
                                            />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                                <div className="w-[64px] h-[64px] bg-slate-50 rounded-full flex items-center justify-center mb-[16px]">
                                                    <svg className="w-[32px] h-[32px] text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                </div>
                                                <p className="text-slate-500 font-bold">No tasks found</p>
                                                {periodType !== 'all' && <p className="text-xs text-slate-400 mt-[4px]">Try changing the period filter</p>}
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Disconnect Confirmation Modal */}
            {showDisconnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-[32px] w-full max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200 border border-white">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-[64px] h-[64px] bg-red-50 rounded-full flex items-center justify-center mb-[24px] border border-red-100 shadow-lg shadow-red-500/10">
                                <FaGoogle className="text-2xl text-[#ff4d4d]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Disconnect Calendar?</h3>
                            <p className="text-slate-500 text-sm font-medium mb-[32px]">
                                Are you sure you want to disconnect? You will stop receiving automatic event syncs.
                            </p>
                            <div className="flex w-full gap-[12px]">
                                <button
                                    onClick={() => setShowDisconnectModal(false)}
                                    className="flex-1 py-[12px] px-[24px] rounded-[12px] font-black text-[13px] tracking-widest uppercase border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDisconnect}
                                    className="flex-1 py-[12px] px-[24px] rounded-[12px] font-black text-[13px] tracking-widest uppercase bg-[#ff4d4d] text-white shadow-lg shadow-red-500/20 hover:bg-[#ff3333] hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MfgReminderDashboard;
