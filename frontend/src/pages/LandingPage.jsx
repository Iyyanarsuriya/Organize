import { Link } from 'react-router-dom';
import {
    Bell,
    ArrowRight,
    Cloud,
    RefreshCcw,
    TrendingUp,
    Wallet,
    BarChart3,
    UserCheck,
    User,
    Factory,
} from 'lucide-react';

const LandingPage = ({ token, user, onProfileClick, onSignupClick }) => {
    const isLoggedIn = !!token;

    return (
        <div className="bg-[#f8fafc] min-h-screen font-['Outfit',sans-serif] text-slate-800 overflow-x-hidden">
            {/* Hero Section */}
            <section className="pt-[100px] lg:pt-[120px] pb-[80px] px-[20px] sm:px-[30px] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-[9999px] blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-[1280px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-[40px] lg:gap-[80px] items-center">
                        <div className="animate-in fade-in slide-in-from-left-10 duration-700 text-center lg:text-left">
                            <h1 className="text-[42px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-black text-[#1a1c21] leading-[1.1] mb-[16px] tracking-tight">
                                {isLoggedIn ? (
                                    <>Welcome Back to <span className="text-blue-600">Operations Hub</span></>
                                ) : (
                                    <>Your Sector <span className="text-blue-600">Organizer</span></>
                                )}
                            </h1>
                            <p className="text-[12px] sm:text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] mb-[40px]">
                                PRODUCTIVITY MEETS CONTROL
                            </p>

                            {isLoggedIn ? (
                                <div className="flex flex-col gap-[24px] mb-[48px] items-center lg:items-start">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Go to your workspace:</p>
                                    <Link
                                        to="/operations"
                                        className="inline-flex items-center gap-[12px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[12px] tracking-widest px-[32px] py-[20px] rounded-[24px] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-[2px]"
                                    >
                                        Enter Operations Hub <ArrowRight className="w-[16px] h-[16px]" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-[24px] mb-[48px] items-center lg:items-start">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Access the system:</p>
                                    <button
                                        onClick={() => { localStorage.setItem('selectedSector', 'operations'); onSignupClick(); }}
                                        className="inline-flex items-center gap-[12px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[12px] tracking-widest px-[32px] py-[20px] rounded-[24px] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-[2px]"
                                    >
                                        Create Account / Login <ArrowRight className="w-[16px] h-[16px]" />
                                    </button>
                                </div>
                            )}

                            {/* Center Feature Cards */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px] max-w-[896px] mx-auto lg:mx-0">
                                <Link to="/operations/reminders" className="block">
                                    <div className="p-[24px] sm:p-[32px] rounded-[32px] sm:rounded-[40px] bg-[#eff6ff] border border-blue-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 h-full">
                                        <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] bg-[#2d5bff] rounded-[20px] sm:rounded-[24px] flex items-center justify-center mb-[20px] sm:mb-[24px] shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            <Bell className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] text-white" />
                                        </div>
                                        <h3 className="text-[18px] sm:text-[20px] font-black text-[#2d5bff] mb-[8px] sm:mb-[12px]">Reminders</h3>
                                        <p className="text-slate-400 text-[13px] sm:text-[14px] font-medium leading-relaxed mb-[16px]">
                                            Never miss what matters with our smart notification system.
                                        </p>
                                    </div>
                                </Link>

                                <Link to="/operations/expenses" className="block">
                                    <div className="p-[24px] sm:p-[32px] rounded-[32px] sm:rounded-[40px] bg-[#ecfdf5] border border-emerald-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 h-full">
                                        <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] bg-[#00d1a0] rounded-[20px] sm:rounded-[24px] flex items-center justify-center mb-[20px] sm:mb-[24px] shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <Wallet className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] text-white" />
                                        </div>
                                        <h3 className="text-[18px] sm:text-[20px] font-black text-[#00d1a0] mb-[8px] sm:mb-[12px]">Expense</h3>
                                        <p className="text-slate-400 text-[13px] sm:text-[14px] font-medium leading-relaxed mb-[16px]">
                                            Track spending and manage your budget with absolute ease.
                                        </p>
                                    </div>
                                </Link>

                                <Link to="/operations/attendance" className="block sm:col-span-2 lg:col-span-1">
                                    <div className="p-[24px] sm:p-[32px] rounded-[32px] sm:rounded-[40px] bg-[#fff7ed] border border-orange-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 h-full">
                                        <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] bg-orange-500 rounded-[20px] sm:rounded-[24px] flex items-center justify-center mb-[20px] sm:mb-[24px] shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                            <UserCheck className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] text-white" />
                                        </div>
                                        <h3 className="text-[18px] sm:text-[20px] font-black text-orange-600 mb-[8px] sm:mb-[12px]">Attendance</h3>
                                        <p className="text-slate-400 text-[13px] sm:text-[14px] font-medium leading-relaxed mb-[16px]">
                                            Log presence and track consistency like a pro every single day.
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in slide-in-from-right-10 duration-1000 delay-200 hidden lg:flex justify-end">
                            <div className="relative z-10 scale-105 lg:scale-110">
                                <div className="navigate-home-container bg-white rounded-[32px] sm:rounded-[48px] p-[16px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[500px]">
                                    <div className="bg-[#1a1c21] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl p-[16px] flex flex-col items-center justify-center text-center text-white min-h-[300px]">
                                        <Factory className="w-[96px] h-[96px] text-blue-500 mb-[24px] animate-pulse" />
                                        <h3 className="text-2xl font-black mb-[8px]">OrganizerPro</h3>
                                        <p className="text-slate-400 text-sm max-w-[300px]">Standalone Portal for Operations & Business Management</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Icon Row */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-[24px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[48px] lg:gap-[32px]">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-[56px] h-[56px] rounded-[16px] bg-blue-50 flex items-center justify-center mb-[24px] group-hover:bg-blue-100 transition-colors">
                                <RefreshCcw className="w-[28px] h-[28px] text-blue-500" />
                            </div>
                            <h4 className="font-black text-[#1a1c21] text-base mb-[8px]">Smart Sync</h4>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Work life together</p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-[56px] h-[56px] rounded-[16px] bg-emerald-50 flex items-center justify-center mb-[24px] group-hover:bg-emerald-100 transition-colors">
                                <BarChart3 className="w-[28px] h-[28px] text-emerald-500" />
                            </div>
                            <h4 className="font-black text-[#1a1c21] text-base mb-[8px]">Analytics View</h4>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time insights</p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-[56px] h-[56px] rounded-[16px] bg-orange-50 flex items-center justify-center mb-[24px] group-hover:bg-orange-100 transition-colors">
                                <UserCheck className="w-[28px] h-[28px] text-orange-500" />
                            </div>
                            <h4 className="font-black text-[#1a1c21] text-base mb-[8px]">Attendance Log</h4>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Daily consistency</p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-[56px] h-[56px] rounded-[16px] bg-indigo-50 flex items-center justify-center mb-[24px] group-hover:bg-indigo-100 transition-colors">
                                <TrendingUp className="w-[28px] h-[28px] text-indigo-500" />
                            </div>
                            <h4 className="font-black text-[#1a1c21] text-base mb-[8px]">Habit Analysis</h4>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Productivity sync</p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-[56px] h-[56px] rounded-[16px] bg-sky-50 flex items-center justify-center mb-[24px] group-hover:bg-sky-100 transition-colors">
                                <Cloud className="w-[28px] h-[28px] text-sky-400" />
                            </div>
                            <h4 className="font-black text-[#1a1c21] text-base mb-[8px]">Cloud Backup</h4>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Never lose data</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
