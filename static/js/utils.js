const Utils = {
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatTime: function(date = new Date()) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    formatDate: function(date = new Date()) {
        return date.toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text)
        .then(() => console.log("copied"))
        .catch(err => console.log('failed to copy', err))
    },

    downloadJSON: function(data, filename = "data.json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    validatePlayerID: function(id) {
        return id && id.trim().length > 0;
    },

    validateReward: function(amount) {
        return !isNaN(amount) && amount >= 0;
    }
};