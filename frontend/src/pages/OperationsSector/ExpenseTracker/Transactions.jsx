import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaExchangeAlt, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaProjectDiagram, FaTruck } from 'react-icons/fa';
import { formatDateTime, formatAmount } from '../../../utils/formatUtils';
import ExportButtons from '../../../components/Common/ExportButtons';

const Transactions = ({
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    handleAddNewTransaction,
    handleEdit,
    confirmDelete,

    // New Props for internal filters
    projects = [], members = [], roles = [],
    filterProject, setFilterProject,
    filterMember, setFilterMember,
    filterRole, setFilterRole,
    filterVehicle, setFilterVehicle, vehicleNames = [],
    periodType, setPeriodType,
    currentPeriod, setCurrentPeriod,
    customRange, setCustomRange,
    onExportCSV, onExportPDF, onExportTXT
}) => {
    return (
        <div className="animate-in slide-in-from-right-10 duration-500">
            {/* Single unified card: filters + transaction list together */}
            <div className="bg-white rounded-[24px] sm:rounded-[36px] border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden">

                {/* ── Header + Filters ── */}
                <div className="p-[16px] sm:p-[24px] border-b border-slate-100">
                    {/* Title & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-[12px] sm:gap-[24px] mb-[16px] sm:mb-[24px]">
                        <div>
                            <h2 className="text-[18px] sm:text-[24px] font-black text-slate-800 tracking-tight">Transactions</h2>
                            <p className="text-[11px] sm:text-[14px] font-medium text-slate-400 mt-[4px]">Manage and track your financial records</p>
                        </div>
                        <div className="flex items-center gap-[12px]">
                            <ExportButtons onExportCSV={onExportCSV} onExportPDF={onExportPDF} onExportTXT={onExportTXT} />
                            <button onClick={handleAddNewTransaction} className="bg-blue-600 hover:bg-blue-700 text-white py-[10px] px-[24px] rounded-[16px] shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-[8px] group">
                                <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="text-xs font-bold uppercase tracking-widest">New</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-col lg:flex-row gap-[12px] sm:gap-[16px]">
                        {/* Left: Period & Date */}
                        <div className="flex flex-col sm:flex-row gap-[8px] p-[6px] sm:p-[6px] bg-slate-50 rounded-[14px] sm:rounded-[16px] border border-slate-100 shrink-0">
                            {/* Period Tabs */}
                            <div className="flex bg-white rounded-[10px] sm:rounded-[12px] shadow-sm p-[4px] gap-[4px] overflow-x-auto sm:overflow-visible">
                                {['day', 'week', 'month', 'range'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setPeriodType(type)}
                                        className={`
                                            flex-1 px-[12px] sm:px-[16px] h-[28px] sm:h-[32px] rounded-[8px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:outline-none ring-0 whitespace-nowrap
                                            ${periodType === type
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            {/* Date Input */}
                            <div className="px-[8px] sm:px-[12px] flex items-center w-full sm:w-auto sm:min-w-[140px] border-t sm:border-t-0 sm:border-l border-slate-200 mt-[4px] sm:mt-0 pt-[8px] sm:pt-0 sm:pl-[16px] sm:ml-[8px] overflow-hidden">
                                <FaCalendarAlt className="text-slate-300 mr-[8px] shrink-0" size={12} />
                                {periodType === 'day' ? <input type="date" value={currentPeriod.length === 10 ? currentPeriod : ''} onChange={(e) => setCurrentPeriod(e.target.value)} className="w-full text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none bg-transparent font-mono" /> :
                                    periodType === 'week' ? <input type="week" value={currentPeriod.includes('W') ? currentPeriod : ''} onChange={(e) => setCurrentPeriod(e.target.value)} className="w-full text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none bg-transparent font-mono" /> :
                                        periodType === 'month' ? <input type="month" value={currentPeriod.length === 7 ? currentPeriod : ''} onChange={(e) => setCurrentPeriod(e.target.value)} className="w-full text-[11px] sm:text-[12px] font-bold text-slate-700 outline-none bg-transparent font-mono" /> :
                                            <div className="flex items-center gap-[8px] w-full"><input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="text-[10px] sm:text-[11px] font-bold text-slate-700 w-full bg-transparent font-mono" /><span className="text-slate-300">-</span><input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="text-[10px] sm:text-[11px] font-bold text-slate-700 w-full bg-transparent font-mono" /></div>}
                            </div>
                        </div>

                        {/* Right: Entity Filters & Search */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-[8px] sm:gap-[12px]">
                            {/* Project - Indigo */}
                            <div className="relative group">
                                <FaProjectDiagram className="absolute left-[10px] sm:left-[16px] top-1/2 -translate-y-1/2 text-indigo-400 group-hover:text-indigo-500 transition-colors" size={10} />
                                <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="w-full bg-indigo-50 hover:bg-indigo-100 border border-transparent rounded-[14px] sm:rounded-[16px] py-[8px] sm:py-[12px] pl-[28px] sm:pl-[40px] pr-[20px] sm:pr-[40px] text-[9px] sm:text-[12px] font-black text-indigo-600 text-center outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer appearance-none uppercase tracking-wide">
                                    <option value="">All Projects</option>
                                    {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <div className="absolute right-[8px] md:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-[9px]">▼</div>
                            </div>

                            {/* Member - Emerald */}
                            <div className="relative group">
                                <FaUser className="absolute left-[10px] sm:left-[16px] top-1/2 -translate-y-1/2 text-emerald-400 group-hover:text-emerald-500 transition-colors" size={10} />
                                <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)} className="w-full bg-emerald-50 hover:bg-emerald-100 border border-transparent rounded-[14px] sm:rounded-[16px] py-[8px] sm:py-[12px] pl-[28px] sm:pl-[40px] pr-[20px] sm:pr-[40px] text-[9px] sm:text-[12px] font-black text-emerald-600 text-center outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer appearance-none uppercase tracking-wide">
                                    <option value="">All Members</option>
                                    <option value="guest">Guests / Non-Members</option>
                                    {Array.isArray(members) && members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <div className="absolute right-[8px] md:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-[9px]">▼</div>
                            </div>

                            {/* Vehicle - Orange */}
                            <div className="relative group">
                                <FaTruck className="absolute left-[12px] md:left-[16px] top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors" size={12} />
                                <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="w-full bg-orange-50 hover:bg-orange-100 border border-transparent rounded-[16px] py-[8px] md:py-[12px] pl-[32px] md:pl-[40px] pr-[24px] md:pr-[40px] text-[10px] md:text-[12px] font-black text-orange-600 text-center outline-none focus:ring-2 focus:ring-orange-200 transition-all cursor-pointer appearance-none uppercase tracking-wide">
                                    <option value="">All Vehicles</option>
                                    {Array.isArray(vehicleNames) && vehicleNames.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <div className="absolute right-[8px] md:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-orange-400 text-[10px]">▼</div>
                            </div>

                            {/* Type - Purple */}
                            <div className="relative group">
                                <FaFilter className="absolute left-[12px] md:left-[16px] top-1/2 -translate-y-1/2 text-purple-400 group-hover:text-purple-500 transition-colors" size={12} />
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-purple-50 hover:bg-purple-100 border border-transparent rounded-[16px] py-[8px] md:py-[12px] pl-[32px] md:pl-[40px] pr-[24px] md:pr-[40px] text-[10px] md:text-[12px] font-black text-purple-600 text-center outline-none focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer appearance-none uppercase tracking-wide">
                                    <option value="all">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                <div className="absolute right-[8px] md:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 text-[10px]">▼</div>
                            </div>

                            {/* Search - Blue */}
                            <div className="relative col-span-2 md:col-span-4 group">
                                <FaSearch className="absolute left-[12px] md:left-[16px] top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-500 transition-colors" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-[16px] py-[8px] md:py-[12px] pl-[32px] md:pl-[40px] pr-[16px] text-[10px] md:text-[12px] font-medium text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Transaction List (inside the same card) ── */}
                <div className="divide-y divide-slate-50">
                    {Array.isArray(filteredTransactions) && filteredTransactions.map(t => (
                        <div key={t.id} className="group bg-white hover:bg-slate-50/70 px-[16px] sm:px-[24px] py-[14px] sm:py-[20px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-[10px] sm:gap-[16px]">
                            <div className="flex items-center gap-[10px] sm:gap-[16px] overflow-hidden">
                                <div className={`w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-[12px] sm:rounded-[16px] flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                    <FaExchangeAlt className={`${t.type === 'income' ? '' : 'rotate-180'} text-[14px] sm:text-[18px]`} />
                                </div>
                                <div className="min-w-0 flex-1 sm:flex-initial">
                                    <h3 className="text-[13px] sm:text-sm font-bold text-slate-800 tracking-tight truncate line-clamp-1">
                                        {t.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-[4px] sm:gap-[8px] mt-[2px]">
                                        <div className={`px-[6px] py-[2px] text-[7px] font-black rounded-full flex items-center uppercase tracking-tighter ${t.type === 'income' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type}
                                        </div>
                                        <div className="px-[6px] py-[2px] bg-slate-100 text-[7px] font-black text-slate-500 rounded-full flex items-center uppercase tracking-tighter">
                                            {t.category}
                                        </div>
                                        {t.project_name && (
                                            <div className="px-[6px] py-[2px] bg-indigo-50 text-[7px] font-black text-indigo-500 rounded-full flex items-center uppercase tracking-tighter">
                                                {t.project_name}
                                            </div>
                                        )}
                                        {t.member_name && (
                                            <div className={`px-[6px] py-[2px] text-[7px] font-black rounded-full flex items-center uppercase tracking-tighter ${!t.member_id ? 'bg-amber-50 text-amber-600' : 'bg-orange-50 text-orange-500'}`}>
                                                {!t.member_id && 'GUEST: '}{t.member_name}
                                            </div>
                                        )}
                                        <div className="px-[6px] py-[2px] bg-slate-50 text-[7px] font-black text-slate-400 rounded-full flex items-center uppercase tracking-tighter">
                                            {formatDateTime(t.updated_at || t.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-[12px] sm:gap-[24px] border-t sm:border-t-0 pt-[12px] sm:pt-0 border-slate-50">
                                <div className="text-right">
                                    <p className={`text-lg sm:text-[20px] font-black tracking-tight ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{formatAmount(t.amount)}
                                    </p>
                                    {(t.quantity > 1 || (t.unit_price > 0 && t.unit_price != t.amount)) && (
                                        <p className="text-[10px] font-bold text-slate-400 mt-[2px]">
                                            {formatAmount(t.quantity)} x ₹{formatAmount(t.unit_price)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-[4px] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(t)} className="w-[36px] h-[36px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                                        <FaEdit size={14} />
                                    </button>
                                    <button onClick={() => confirmDelete(t.id)} className="w-[36px] h-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-[48px] sm:py-[64px]">
                            <div className="w-[60px] h-[60px] bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-[16px]">
                                <FaExchangeAlt className="text-slate-300" size={22} />
                            </div>
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">No transactions found</p>
                            <p className="text-[11px] text-slate-300 mt-[4px]">Try adjusting your filters or date range</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Transactions;
