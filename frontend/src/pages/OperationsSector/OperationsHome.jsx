import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Wallet, Calendar, Users, DollarSign } from 'lucide-react';

const OperationsHome = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 p-[20px] sm:p-[40px] flex flex-col justify-center animate-in fade-in duration-500">
            <div className="max-w-[1200px] mx-auto w-full">

                {/* Section Header */}
                <div className="text-center mb-[40px] sm:mb-[60px]">
                    <span className="px-[16px] py-[6px] rounded-full bg-blue-50 text-blue-600 text-[12px] font-black uppercase tracking-wider border border-blue-100">
                        Operations & Business Hub
                    </span>
                    <h1 className="text-[32px] sm:text-[48px] font-black text-slate-900 tracking-tight mt-[16px]">
                        Control Center
                    </h1>
                    <p className="text-slate-500 text-[15px] sm:text-[18px] font-medium max-w-[600px] mx-auto mt-[8px]">
                        Select a module to manage tasks, finances, attendance, staff, and payroll.
                    </p>
                </div>

                {/* 5 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] sm:gap-[32px]">

                    {/* Card 1: Reminder Tracker */}
                    <Link to="/operations/reminders" className="group flex flex-col items-center justify-center p-[32px] sm:p-[40px] rounded-[32px] sm:rounded-[40px] bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 hover:border-blue-200 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95">
                        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300 mb-[24px]">
                            <Bell className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]" />
                        </div>
                        <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 mb-[8px]">Reminders</h3>
                        <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium text-center">Manage daily operational tasks and automated alerts.</p>
                    </Link>

                    {/* Card 2: Financial Expense Tracker */}
                    <Link to="/operations/expenses" className="group flex flex-col items-center justify-center p-[32px] sm:p-[40px] rounded-[32px] sm:rounded-[40px] bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95">
                        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-[24px] bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300 mb-[24px]">
                            <Wallet className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]" />
                        </div>
                        <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 mb-[8px]">Expenses & Income</h3>
                        <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium text-center">Track financial cash flow, vouchers, and transactions.</p>
                    </Link>

                    {/* Card 3: Attendance Tracker */}
                    <Link to="/operations/attendance" className="group flex flex-col items-center justify-center p-[32px] sm:p-[40px] rounded-[32px] sm:rounded-[40px] bg-orange-50/50 hover:bg-orange-50 border border-orange-100/50 hover:border-orange-200 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95">
                        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-[24px] bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300 mb-[24px]">
                            <Calendar className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]" />
                        </div>
                        <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 mb-[8px]">Attendance</h3>
                        <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium text-center">Track daily presents, leaves, permissions, and shifts.</p>
                    </Link>

                    {/* Card 4: Team Management */}
                    <Link to="/operations/team" className="group flex flex-col items-center justify-center p-[32px] sm:p-[40px] rounded-[32px] sm:rounded-[40px] bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 hover:border-purple-200 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl hover:shadow-purple-500/20 active:scale-95">
                        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-[24px] bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300 mb-[24px]">
                            <Users className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]" />
                        </div>
                        <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 mb-[8px]">Team Management</h3>
                        <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium text-center">Manage staff profiles, roles, permissions, and access.</p>
                    </Link>

                    {/* Card 5: Operations Payroll */}
                    <Link to="/operations/payroll" className="group flex flex-col items-center justify-center p-[32px] sm:p-[40px] rounded-[32px] sm:rounded-[40px] bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 hover:border-rose-200 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl hover:shadow-rose-500/20 active:scale-95">
                        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-[24px] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300 mb-[24px]">
                            <DollarSign className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]" />
                        </div>
                        <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 mb-[8px]">Operations Payroll</h3>
                        <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium text-center">Generate monthly salary slips and payout calculations.</p>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default OperationsHome;
