import { useState } from 'react';
import { FaUserCircle, FaPhoneAlt, FaLock, FaTimes, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_LOGIN_URL = 'http://localhost:5001/api/operations-sector/member-portal/login';

export default function EmployeeLoginModal({ show, onClose, onLoginSuccess }) {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone.trim() && !name.trim()) {
            return toast.error('Please enter your phone number or name');
        }

        try {
            setLoading(true);
            const res = await axios.post(API_LOGIN_URL, { phone, name });
            if (res.data && res.data.success) {
                toast.success(`Welcome back, ${res.data.member.name}!`);
                localStorage.setItem('employee_member', JSON.stringify(res.data.member));
                localStorage.setItem('user_role', 'employee');
                if (onLoginSuccess) onLoginSuccess(res.data.member);
                onClose();
                navigate('/operations/my-portal');
            } else {
                toast.error(res.data?.message || 'Login failed');
            }
        } catch (error) {
            console.error('Employee Login Error:', error);
            toast.error(error.response?.data?.message || 'Invalid member credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                    >
                        <FaTimes />
                    </button>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl text-white shadow-inner">
                        <FaUserCircle />
                    </div>
                    <h3 className="text-xl font-black">Employee / Staff Login</h3>
                    <p className="text-blue-100 text-xs mt-1">Access your personal attendance, leave balances & payslips</p>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Registered Mobile Phone Number
                        </label>
                        <div className="relative">
                            <FaPhoneAlt className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter mobile number (e.g. 9876543210)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 h-11 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase">OR</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Staff / Member Name
                        </label>
                        <div className="relative">
                            <FaUserCheck className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 h-11 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Sign In to Employee Portal'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}
