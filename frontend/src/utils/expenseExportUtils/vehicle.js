import { generateCSV, generateTXT, generatePDF } from '../exportUtils/base.js';
import { formatAmount } from '../formatUtils.js';

export const exportVehicleLogToCSV = (data, filename) => {
    // Summary
    const totalIncome = data.reduce((sum, log) => sum + (parseFloat(log.income_amount) || 0), 0);
    const totalExpense = data.reduce((sum, log) => sum + (parseFloat(log.expense_amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const totalDistance = data.reduce((sum, log) => sum + ((parseFloat(log.end_km) || 0) - (parseFloat(log.start_km) || 0)), 0);

    const summaryRows = [
        ["VEHICLE LOG SUMMARY"],
        ["Total Income", totalIncome],
        ["Total Expense", totalExpense],
        ["Net Profit", netProfit],
        ["Total Distance (km)", totalDistance],
        []
    ];

    const headers = ["Date", "Vehicle Name", "Vehicle No.", "Driver", "Out Time", "In Time", "Start KM", "End KM", "Distance", "Expense", "Income", "Notes"];
    const rows = [
        ...summaryRows,
        headers,
        ...data.map(log => [
            new Date(log.out_time || log.created_at).toLocaleDateString('en-GB'),
            log.vehicle_name || '',
            log.vehicle_number,
            log.driver_name || '',
            log.out_time ? new Date(log.out_time).toLocaleString('en-GB') : '-',
            log.in_time ? new Date(log.in_time).toLocaleString('en-GB') : '-',
            log.start_km || '-',
            log.end_km || '-',
            (log.end_km && log.start_km) ? (log.end_km - log.start_km) : '-',
            log.expense_amount || 0,
            log.income_amount || 0,
            log.notes || ''
        ])
    ];

    generateCSV("", rows, filename);
};

export const exportVehicleLogToTXT = ({ data, period, filename }) => {
    const totalIncome = data.reduce((sum, log) => sum + (parseFloat(log.income_amount) || 0), 0);
    const totalExpense = data.reduce((sum, log) => sum + (parseFloat(log.expense_amount) || 0), 0);

    const stats = [
        { label: 'Total Income', value: `Rs. ${formatAmount(totalIncome)}` },
        { label: 'Total Expense', value: `Rs. ${formatAmount(totalExpense)}` },
        { label: 'Net Profit', value: `Rs. ${formatAmount(totalIncome - totalExpense)}` },
        { label: 'Total Logs', value: data.length.toString() }
    ];

    const logHeaders = ["Date", "Vehicle Name", "Vehicle No.", "Driver", "Expense", "Income", "Notes"];
    const logRows = data.map(log => [
        new Date(log.out_time || log.created_at).toLocaleDateString('en-GB'),
        log.vehicle_name || '-',
        log.vehicle_number,
        log.driver_name || '-',
        `Rs. ${formatAmount(log.expense_amount || 0)}`,
        `Rs. ${formatAmount(log.income_amount || 0)}`,
        log.notes || ''
    ]);

    generateTXT({ title: 'Vehicle Log Report', period, stats, logHeaders, logRows, filename });
};

export const exportVehicleLogToPDF = ({ data, period, subHeader, filename }) => {
    const totalIncome = data.reduce((sum, log) => sum + (parseFloat(log.income_amount) || 0), 0);
    const totalExpense = data.reduce((sum, log) => sum + (parseFloat(log.expense_amount) || 0), 0);

    const stats = [
        { label: 'Total Income', value: `Rs. ${formatAmount(totalIncome)}` },
        { label: 'Total Expense', value: `Rs. ${formatAmount(totalExpense)}` },
        { label: 'Net Profit', value: `Rs. ${formatAmount(totalIncome - totalExpense)}` },
        { label: 'Total Logs', value: data.length.toString() }
    ];

    const tableHeaders = ['Date', 'Vehicle', 'No.', 'Driver', 'OUT', 'IN', 'Distance', 'Exp', 'Inc', 'Notes'];
    const tableRows = data.map(log => [
        new Date(log.out_time || log.created_at).toLocaleDateString('en-GB'),
        log.vehicle_name || '-',
        log.vehicle_number,
        log.driver_name || '-',
        log.out_time ? new Date(log.out_time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-',
        log.in_time ? new Date(log.in_time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-',
        (log.end_km && log.start_km) ? `${log.end_km - log.start_km}` : '-',
        `${formatAmount(log.expense_amount || 0)}`,
        `${formatAmount(log.income_amount || 0)}`,
        log.notes || ''
    ]);

    generatePDF({ title: 'Vehicle Log Report', period, subHeader, stats, tableHeaders, tableRows, filename, themeColor: [37, 99, 235] });
};
