import React, { useState } from 'react';
import { FaBusinessTime, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ShiftManager = ({ shifts, onAdd, onDelete }) => {
    const [newShift, setNewShift] = useState({ name: '', start_time: '', end_time: '', break_duration: 60, is_default: false });

    const handleAdd = async () => {
        if (!newShift.name || !newShift.start_time || !newShift.end_time) return toast.error("Name and Times are required");
        try {
            await onAdd(newShift);
            toast.success("Shift added");
            setNewShift({ name: '', start_time: '', end_time: '', break_duration: 60, is_default: false });
        } catch (e) { toast.error("Failed to add shift"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this shift?")) {
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
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] bg-blue-50 rounded-[10px] sm:rounded-[12px] flex items-center justify-center text-blue-500 shrink-0">
                    <FaBusinessTime />
                </div>
                <div>
                    <h3 className="text-[16px] sm:text-[18px] font-black text-slate-900">Shifts &amp; Rules</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400">Configure working hours</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] sm:gap-[24px]">
                {/* Add Form */}
                <div className="space-y-[16px]">
                    <div className="bg-slate-50 p-[14px] sm:p-[24px] rounded-[16px] sm:rounded-[16px] border border-slate-100">
                        <h4 className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-slate-500 mb-[14px] sm:mb-[16px]">Add Shift</h4>
                        <div className="space-y-[12px]">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                <input
                                    id="shift-name"
                                    type="text"
                                    value={newShift.name}
                                    onChange={e => setNewShift({ ...newShift, name: e.target.value })}
                                    className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="e.g. Morning Shift"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-[8px]">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</label>
                                    <input
                                        id="shift-start"
                                        type="time"
                                        value={newShift.start_time}
                                        onChange={e => setNewShift({ ...newShift, start_time: e.target.value })}
                                        className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End</label>
                                    <input
                                        id="shift-end"
                                        type="time"
                                        value={newShift.end_time}
                                        onChange={e => setNewShift({ ...newShift, end_time: e.target.value })}
                                        className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Break (Mins)</label>
                                <input
                                    type="number"
                                    value={newShift.break_duration}
                                    onChange={e => setNewShift({ ...newShift, break_duration: parseInt(e.target.value) })}
                                    className="w-full mt-[4px] px-[12px] py-[8px] sm:py-[8px] bg-white border border-slate-200 rounded-[8px] text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-[8px] pt-[8px]">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={newShift.is_default}
                                    onChange={e => setNewShift({ ...newShift, is_default: e.target.checked })}
                                    className="w-[16px] h-[16px] text-blue-600 rounded-[4px] focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="isDefault" className="text-[11px] sm:text-[12px] font-bold text-slate-600 cursor-pointer">Set as Default Shift</label>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="w-full py-[10px] sm:py-[10px] bg-blue-600 text-white rounded-[8px] text-[11px] sm:text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                Add Shift
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
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400">Timings</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Break</th>
                                    <th className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {shifts.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-[24px] py-[32px] sm:py-[24px] text-center text-[11px] sm:text-[12px] font-bold text-slate-400">No shifts defined yet.</td>
                                    </tr>
                                ) : (
                                    shifts.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[11px] sm:text-[12px] font-bold text-slate-700">
                                                {s.name}
                                                {s.is_default === 1 && <span className="ml-[8px] px-[6px] py-[2px] bg-emerald-50 text-emerald-600 rounded-[4px] text-[9px] font-black uppercase">Default</span>}
                                            </td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[11px] sm:text-[12px] font-bold text-slate-700">
                                                {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                            </td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-[11px] sm:text-[12px] font-bold text-slate-700 text-center">{s.break_duration}m</td>
                                            <td className="px-[14px] sm:px-[24px] py-[10px] sm:py-[12px] text-right">
                                                <button
                                                    onClick={() => handleDelete(s.id)}
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

export default ShiftManager;
