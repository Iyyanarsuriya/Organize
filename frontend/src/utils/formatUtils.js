/**
 * Reusable Formatting Utilities
 */

export const formatAmount = (value) => {
    const num = parseFloat(value || 0);
    // If it's a whole number, don't show decimals. Otherwise show up to 2.
    return num % 1 === 0
        ? num.toLocaleString('en-IN')
        : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}/${month}/${year} - ${formattedHours}:${minutes} ${ampm}`;
};
