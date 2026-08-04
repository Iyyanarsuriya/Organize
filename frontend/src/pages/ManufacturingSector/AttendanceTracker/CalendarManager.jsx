import React, { useState } from 'react';
import { FaCalendarAlt, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CalendarManager = ({ holidays, onAdd, onDelete }) => {
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'National' });

    const handleAdd = async () => {
        if (!newHoliday.name || !newHoliday.date) return toast.error("Name and Date are required");
        try {
            await onAdd(newHoliday);
            toast.success("Holiday added");
            setNewHoliday({ name: '', date: '', type: 'National' });
        } catch (e) { toast.error("Failed to add holiday"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this holiday?")) {
            try {
                await onDelete(id);
                toast.success("Deleted");
            } catch (e) { toast.error("Failed to delete"); }
        }
    };

    return (
        <div className="bg-white rounded-[16px] sm:rounded-[24px] p-[16px] sm:p-[24px] shadow-sm border border-slate-100">
            {/* Header */}
            <div className="flex items-center gap-[10px] sm:gap-[12px] mb-[20px] sm:mb-[24px]">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] bg-rose-50 rounded-[10px] sm:rounded-[12px] flex items-center justify-center text-rose-500 shrink-0">
                    <FaCalendarAlt />
                </div>
                <div>
                    <h3 className="text-[16px] sm:text-[18px] font-black text-slate-900">Calendar &amp; Holidays</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400">Manage non-working days</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] sm:gap-[24px]">
                {/* Add Form */}
                <div className="space-y-[16px]">
                    <div className="bg-slate-50 p-[14px] sm:p-[24px] rounded-[16px] sm:rounded-[16px] border border-slate-100">
                        <h4 className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-slate-500 mb-[14px] sm:mb-[16px]">Add Holiday</h4>
                        <div className="space-y-[12px]">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                <input
                                    id="holiday-name"
                                    type="text"
                                    value={newHoliday.name}
                                    onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                    className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-rose-500"
                                    placeholder="e.g. Diwali"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                                <input
                                    id="holiday-date"
                                    type="date"
                                    value={newHoliday.date}
                                    onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                    className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-rose-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                                <select
                                    value={newHoliday.type}
                                    onChange={e => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                    className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-rose-500"
                                >
                                    <option value="National">National</option>
                                    <option value="Regional">Regional</option>
                                    <option value="Company">Company</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="w-full py-[10px] sm:py-[10px] bg-rose-500 text-white rounded-[8px] text-[11px] sm:text-[12px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                            >
                                Add Holiday
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    <div className="overflow-hidden rounded-[16px] sm:rounded-[16px] border border-slate-100 overflow-x-auto">
                        <table className="w-full text-left min-w-[380px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {holidays.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-[24px] py-[32px] sm:py-[24px] text-center text-[11px] sm:text-[12px] font-bold text-slate-400">No holidays defined yet.</td>
                                    </tr>
                                ) : (
                                    holidays.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50/50">
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[11px] sm:text-[12px] font-bold text-slate-700">
                                                {new Date(h.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[11px] sm:text-[12px] font-bold text-slate-700">{h.name}</td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px]">
                                                <span className={`px-[8px] py-[4px] rounded-[4px] text-[9px] font-black uppercase tracking-widest ${h.type === 'National' ? 'bg-orange-50 text-orange-600' :
                                                    h.type === 'Regional' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                    }`}>
                                                    {h.type}
                                                </span>
                                            </td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-right">
                                                <button
                                                    onClick={() => handleDelete(h.id)}
                                                    className="p-[6px] sm:p-[8px] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-all"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarManager;
