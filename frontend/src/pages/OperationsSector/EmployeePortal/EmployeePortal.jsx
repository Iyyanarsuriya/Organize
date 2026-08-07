import { useState, useEffect } from 'react';
import { FaUserCheck, FaCalendarAlt, FaMoneyBillWave, FaClock, FaCalendarTimes, FaBriefcase, FaIdCard, FaPhone, FaEnvelope, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/operations-sector/member-portal';

export default function EmployeePortal({ user, onLogout }) {
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Get stored employee member profile
    const storedMember = (() => {
        try {
            const raw = localStorage.getItem('employee_member');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const fetchMyDetails = async (memberId) => {
        if (!memberId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const email = user?.email || storedMember?.email || '';
            const res = await axios.get(`${API_BASE_URL}/my-details?member_id=${memberId}&email=${encodeURIComponent(email)}`);
            if (res.data && res.data.success) {
                setMemberData(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch employee portal details:', error);
            toast.error(error.response?.data?.message || 'Failed to load employee details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storedMember?.id) {
            fetchMyDetails(storedMember.id);
        } else if (user?.id) {
            fetchMyDetails(user.id);
        } else {
            setLoading(false);
        }
    }, []);

    const profile = memberData?.profile || storedMember || {};
    const stats = memberData?.stats || {};
    const attendance = memberData?.attendance || [];
    const transactions = memberData?.transactions || [];

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold text-sm">Loading Employee Portal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-[28px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : <FaIdCard />}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.name || 'Employee Portal'}</h1>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black rounded-full uppercase tracking-wider">
                                    {profile.status || 'Active Member'}
                                </span>
                            </div>
                            <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><FaBriefcase className="text-blue-300 text-xs"/> {profile.role || 'Team Member'}</span>
                                <span className="flex items-center gap-1.5"><FaPhone className="text-blue-300 text-xs"/> {profile.phone || 'N/A'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold text-blue-100 border border-white/10">
                            Employee Panel
                        </span>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 transition-all rounded-xl text-xs font-bold text-white flex items-center gap-2"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Leave Balances KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* CL Balance */}
                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Casual Leave (CL)</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">CL</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600">
                        {profile.cl_balance ?? 0} <span className="text-xs font-bold text-slate-400">days remaining</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Allocated Casual Leaves</p>
                </div>

                {/* SL Balance */}
                <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-1.5 h-full bg-purple-500 absolute left-0 top-0"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sick Leave (SL)</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">SL</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-purple-600">
                        {profile.sl_balance ?? 0} <span className="text-xs font-bold text-slate-400">days remaining</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Allocated Sick Leaves</p>
                </div>

                {/* EL Balance */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-1.5 h-full bg-blue-500 absolute left-0 top-0"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned Leave (EL)</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">EL</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-600">
                        {profile.el_balance ?? 0} <span className="text-xs font-bold text-slate-400">days remaining</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Privilege / Earned Leaves</p>
                </div>

                {/* Total Presents */}
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Presents</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm"><FaUserCheck /></div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                        {stats.present ?? 0} <span className="text-xs font-bold text-slate-400">days</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Attendance recorded</p>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <FaUserCheck /> Attendance History
                </button>
                <button
                    onClick={() => setActiveTab('payslips')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'payslips' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <FaMoneyBillWave /> Payslips & Ledger
                </button>
            </div>

            {/* TAB 1: Attendance Log */}
            {activeTab === 'overview' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" /> My Attendance Log
                        </h2>
                        <span className="text-xs font-bold text-slate-400">{attendance.length} Total Records</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Check In / Out</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Total Hours</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Permission / OT</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-10 text-center text-slate-400 text-xs font-bold">
                                            No attendance records found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-xs font-bold text-slate-700">
                                                {new Date(row.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                                                    row.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                                                    row.status === 'absent' ? 'bg-rose-100 text-rose-800' :
                                                    row.status === 'half_day' ? 'bg-amber-100 text-amber-800' :
                                                    row.status === 'CL' ? 'bg-amber-100 text-amber-800' :
                                                    row.status === 'SL' ? 'bg-purple-100 text-purple-800' :
                                                    row.status === 'EL' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                {row.check_in || '--:--'} to {row.check_out || '--:--'}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-slate-800">
                                                {row.total_hours ? `${row.total_hours} hrs` : '-'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600">
                                                {row.permission_duration > 0 && <span className="text-amber-600 font-bold block">Perm: {row.permission_duration} hrs</span>}
                                                {row.overtime_duration > 0 && <span className="text-emerald-600 font-bold block">OT: {row.overtime_duration} hrs</span>}
                                                {!row.permission_duration && !row.overtime_duration && '-'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                                                {row.note || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Payslips & Ledger */}
            {activeTab === 'payslips' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <FaMoneyBillWave className="text-emerald-600" /> Payslips & Salary Transactions
                        </h2>
                        <span className="text-xs font-bold text-slate-400">{transactions.length} Ledger Entries</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Category</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Payment Mode</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-xs font-bold">
                                            No financial transactions found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-xs font-bold text-slate-700">
                                                {new Date(tx.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-slate-800">
                                                {tx.category}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                {tx.payment_mode || 'Cash'}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-black text-emerald-600">
                                                ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                                                {tx.description || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
