import { generateCSV, generateTXT, generatePDF } from '../exportUtils/base.js';
import { formatAmount } from '../formatUtils.js';

export const exportWorkLogToCSV = (data, filename) => {
    // Summary
    const totalUnits = data.reduce((sum, log) => sum + (parseFloat(log.units_produced) || 0), 0);
    const totalEarnings = data.reduce((sum, log) => sum + ((parseFloat(log.units_produced) || 0) * (parseFloat(log.rate_per_unit) || 0)), 0);

    const summaryRows = [
        ["WORK LOG SUMMARY"],
        ["Total Units Produced", totalUnits],
        ["Total Earnings", totalEarnings],
        ["Total Records", data.length],
        []
    ];

    const headers = ["Date", "Member/Guest", "Status", "Work Type", "Units/Days", "Rate", "Total Amount", "Notes"];
    const rows = [
        ...summaryRows,
        headers,
        ...data.map(log => [
            new Date(log.date).toLocaleDateString('en-GB'),
            log.member_name || log.guest_name || 'Unknown',
            log.member_id ? 'Member' : 'Guest',
            log.work_type,
            log.units_produced,
            log.rate_per_unit,
            (log.units_produced * log.rate_per_unit).toFixed(2),
            log.notes || ''
        ])
    ];

    generateCSV("", rows, filename);
};

export const exportWorkLogToTXT = ({ data, period, filename }) => {
    const totalUnits = data.reduce((sum, log) => sum + (parseFloat(log.units_produced) || 0), 0);
    const totalEarnings = data.reduce((sum, log) => sum + ((parseFloat(log.units_produced) || 0) * (parseFloat(log.rate_per_unit) || 0)), 0);

    const stats = [
        { label: 'Total Units', value: totalUnits.toString() },
        { label: 'Total Earnings', value: `Rs. ${formatAmount(totalEarnings)}` },
        { label: 'Total Records', value: data.length.toString() }
    ];

    const logHeaders = ["Date", "Name", "Type", "Units", "Amount", "Notes"];
    const logRows = data.map(log => [
        new Date(log.date).toLocaleDateString('en-GB'),
        log.member_name || log.guest_name || '-',
        log.work_type,
        log.units_produced,
        `Rs. ${formatAmount(log.units_produced * log.rate_per_unit)}`,
        log.notes || '-'
    ]);

    generateTXT({ title: 'Work Log Report', period, stats, logHeaders, logRows, filename });
};

export const exportWorkLogToPDF = ({ data, period, subHeader, filename }) => {
    const totalUnits = data.reduce((sum, log) => sum + (parseFloat(log.units_produced) || 0), 0);
    const totalEarnings = data.reduce((sum, log) => sum + ((parseFloat(log.units_produced) || 0) * (parseFloat(log.rate_per_unit) || 0)), 0);

    const stats = [
        { label: 'Total Units', value: totalUnits.toString() },
        { label: 'Total Earnings', value: `Rs. ${formatAmount(totalEarnings)}` },
        { label: 'Total Records', value: data.length.toString() }
    ];

    const tableHeaders = ['Date', 'Name', 'Status', 'Work Type', 'Units', 'Rate', 'Amount', 'Notes'];
    const tableRows = data.map(log => [
        new Date(log.date).toLocaleDateString('en-GB'),
        log.member_name || log.guest_name || '-',
        log.member_id ? 'Member' : 'Guest',
        log.work_type,
        log.units_produced,
        `Rs. ${formatAmount(log.rate_per_unit)}`,
        `Rs. ${formatAmount(log.units_produced * log.rate_per_unit)}`,
        log.notes || ''
    ]);

    generatePDF({ title: 'Work Log Report', period, subHeader, stats, tableHeaders, tableRows, filename, themeColor: [79, 70, 229] }); // Indigo color
};
