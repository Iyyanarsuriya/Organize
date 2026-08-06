import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCSV = (headers, rows, filename) => {
    const escapedRows = rows.map(row =>
        row.map(val => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        })
    );

    const allRows = (Array.isArray(headers) && headers.length > 0) ? [headers, ...escapedRows] : escapedRows;
    const csvContent = allRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generateTXT = ({ title, period, stats, additionalContent, logHeaders, logRows, filename }) => {
    let txt = `==================================================\n`;
    txt += `   ${title.toUpperCase()}\n`;
    txt += `==================================================\n\n`;

    const now = new Date();
    const nowFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    txt += `Period       : ${period}\n`;
    txt += `Generated at : ${nowFormatted}\n`;
    txt += `--------------------------------------------------\n\n`;

    if (stats && stats.length > 0) {
        txt += `SUMMARY\n`;
        txt += `--------------------------------------------------\n`;
        stats.forEach(s => {
            const label = s.label.padEnd(20, ' ');
            txt += `${label}: ${s.value}\n`;
        });
        txt += `\n`;
    }

    if (additionalContent) {
        txt += additionalContent + "\n";
    }

    txt += `DETAILED LOGS\n`;
    txt += `--------------------------------------------------\n`;

    const colWidths = logHeaders.map((h, i) => {
        let max = h.length;
        logRows.forEach(row => {
            if (row[i] && String(row[i]).length > max) max = String(row[i]).length;
        });
        return max + 2;
    });

    txt += logHeaders.map((h, i) => h.padEnd(colWidths[i], ' ')).join(' | ') + '\n';
    txt += colWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';

    logRows.forEach(row => {
        txt += row.map((val, i) => String(val || '').padEnd(colWidths[i], ' ')).join(' | ') + '\n';
    });

    txt += `\n--------------------------------------------------\n`;
    txt += `End of Report\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.txt`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const getStatColors = (label = '', value = '', themeColor = [45, 91, 255]) => {
    const text = (String(label) + ' ' + String(value)).toLowerCase();

    if (text.includes('completed') || text.includes('paid') || text.includes('present') || text.includes('income') || text.includes('approved') || text.includes('success')) {
        return {
            bg: [236, 253, 245],     // Emerald Light
            border: [167, 243, 208], // Emerald Border
            accent: [16, 185, 129],  // Emerald Accent
            text: [6, 78, 59]        // Emerald Text
        };
    }
    if (text.includes('pending') || text.includes('draft') || text.includes('half') || text.includes('medium') || text.includes('progress') || text.includes('late')) {
        return {
            bg: [254, 243, 199],     // Amber Light
            border: [253, 230, 138], // Amber Border
            accent: [245, 158, 11],  // Amber Accent
            text: [120, 53, 15]      // Amber Text
        };
    }
    if (text.includes('absent') || text.includes('overdue') || text.includes('expense') || text.includes('failed') || text.includes('rejected') || text.includes('unpaid') || text.includes('high')) {
        return {
            bg: [254, 226, 226],     // Red Light
            border: [254, 202, 202], // Red Border
            accent: [239, 68, 68],   // Red Accent
            text: [127, 29, 29]      // Red Text
        };
    }
    if (text.includes('holiday') || text.includes('leave') || text.includes('week off') || text.includes('off')) {
        return {
            bg: [243, 232, 255],     // Purple Light
            border: [233, 213, 255], // Purple Border
            accent: [168, 85, 247],  // Purple Accent
            text: [88, 28, 135]      // Purple Text
        };
    }
    // Default Blue / Theme Color Card
    return {
        bg: [239, 246, 255],         // Blue Light
        border: [191, 219, 254],     // Blue Border
        accent: themeColor,          // Theme color
        text: [30, 58, 138]          // Blue Text
    };
};

export const applyStatusCellColor = (data) => {
    if (data.section === 'body') {
        const rawVal = String(data.cell.raw || '').trim();
        const val = rawVal.toLowerCase();

        const successStatus = ['paid', 'approved', 'completed', 'present', 'active', 'success', 'income', 'yes'];
        const warningStatus = ['pending', 'draft', 'half day', 'half-day', 'half_day', 'medium', 'in progress', 'in-progress', 'reverted', 'permission', 'late', 'partially paid', 'partial'];
        const dangerStatus = ['absent', 'overdue', 'rejected', 'failed', 'expense', 'inactive', 'cancelled', 'canceled', 'unpaid', 'high', 'no'];
        const infoStatus = ['low', 'open', 'processing'];
        const purpleStatus = ['holiday', 'week_off', 'week-off', 'week off', 'off', 'leave'];

        // Color text of status values directly (no background fill in table cells)
        if (successStatus.includes(val)) {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald Green text
            data.cell.styles.fontStyle = 'bold';
        } else if (warningStatus.includes(val)) {
            data.cell.styles.textColor = [217, 119, 6];   // Amber text
            data.cell.styles.fontStyle = 'bold';
        } else if (dangerStatus.includes(val)) {
            data.cell.styles.textColor = [239, 68, 68];   // Rose Red text
            data.cell.styles.fontStyle = 'bold';
        } else if (infoStatus.includes(val)) {
            data.cell.styles.textColor = [37, 99, 235];   // Royal Blue text
            data.cell.styles.fontStyle = 'bold';
        } else if (purpleStatus.includes(val)) {
            data.cell.styles.textColor = [147, 51, 234];  // Purple text
            data.cell.styles.fontStyle = 'bold';
        } else {
            // Apply vibrant text colors to numeric financial amounts
            if (val.startsWith('rs.') || val.startsWith('₹') || val.startsWith('+') || val.startsWith('-')) {
                if (val.includes('+') || val.toLowerCase().includes('income')) {
                    data.cell.styles.textColor = [16, 185, 129];
                    data.cell.styles.fontStyle = 'bold';
                } else if (val.includes('-') || val.toLowerCase().includes('expense')) {
                    data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    }
};

export const generatePDF = ({ title, period, subHeader, stats, tableHeaders, tableRows, filename, themeColor = [45, 91, 255], columnStyles = {} }) => {
    const doc = new jsPDF('landscape'); // Landscape for better column visibility
    const pageWidth = doc.internal.pageSize.getWidth();

    // Blue Header Bar
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 20);

    // Subheader/Period
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const nowFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    doc.text(`Period: ${period}  |  Generated on: ${nowFormatted}`, 15, 30);

    // Reset Text Color
    doc.setTextColor(40, 40, 40);

    if (subHeader) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(subHeader, 15, 48);
    }

    let startY = subHeader ? 55 : 48;
    if (stats && stats.length > 0) {
        const gap = 10;
        const totalWidth = pageWidth - 30;
        const itemsPerRow = Math.min(stats.length, 4);
        const cardWidth = (totalWidth - (gap * (itemsPerRow - 1))) / itemsPerRow;
        const cardHeight = 20;

        let currentY = startY;

        stats.forEach((s, i) => {
            const col = i % itemsPerRow;
            const row = Math.floor(i / itemsPerRow);

            if (col === 0 && row > 0) {
                currentY += cardHeight + gap;
            }

            const x = 15 + col * (cardWidth + gap);
            const y = currentY;

            const colors = getStatColors(s.label, s.value, themeColor);

            // Card Background fill
            doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
            doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

            // Card Border stroke
            doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
            doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');

            // Left vertical accent bar
            doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.roundedRect(x, y + 2, 3.5, cardHeight - 4, 1.5, 1.5, 'F');

            // Label text
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(String(s.label).toUpperCase(), x + 8, y + 8);

            // Value text
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.text(String(s.value), x + 8, y + 16);
        });

        const totalRows = Math.ceil(stats.length / itemsPerRow);
        startY = currentY + (totalRows > 1 ? (totalRows - 1) * (cardHeight + gap) : 0) + cardHeight + 12;
    }

    // Default Alignment logic
    let defaultColumnStyles = {
        0: { halign: 'center', valign: 'middle', cellWidth: 25 },
        1: { halign: 'center', valign: 'middle' },
        2: { halign: 'center', valign: 'middle', cellWidth: 30 },
        3: { halign: 'center', valign: 'middle', cellWidth: 20 },
        4: { halign: 'center', valign: 'middle' },
        5: { halign: 'center', valign: 'middle', cellWidth: 30 }
    };

    const finalColumnStyles = { ...defaultColumnStyles, ...columnStyles };

    autoTable(doc, {
        startY: startY,
        head: [tableHeaders],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: themeColor,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: 60,
            halign: 'center',
            valign: 'middle',
            cellPadding: 4
        },
        columnStyles: finalColumnStyles,
        styles: { overflow: 'linebreak' },
        margin: { left: 15, right: 15 },
        didParseCell: applyStatusCellColor,
        didDrawPage: (data) => {
            const str = 'Page ' + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(str, pageWidth - 25, doc.internal.pageSize.getHeight() - 10);
            doc.text(`organizerpro`, 15, doc.internal.pageSize.getHeight() - 10);
        }
    });

    doc.save(`${filename}.pdf`);
};
