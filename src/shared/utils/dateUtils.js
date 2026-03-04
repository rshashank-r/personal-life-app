export const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export const getToday = () => new Date().toISOString().split('T')[0];

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDateTime = (dateStr) => `${formatDate(dateStr)}, ${formatTime(dateStr)}`;

export const getRelativeDate = (dateStr) => {
    if (!dateStr) return '';
    const today = getToday();
    const date = dateStr.split('T')[0];
    if (date === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return formatDate(dateStr);
};

export const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && dateStr.split('T')[0] !== getToday();
};

export const getDaysBetween = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

export const getDateRange = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};
