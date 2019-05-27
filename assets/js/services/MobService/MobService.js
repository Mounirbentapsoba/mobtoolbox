/* globals $*/

export const MobService = {
    cache: {},
    root: 'assets/js',
    getTemplate(url) {
        return $.get(`${window.location.pathname}${this.root}/${url}`);
    },
    formatSeconds(totalSeconds) {
        if (totalSeconds < 1) {
            return `${totalSeconds} seconds`;
        }
        const hours = parseInt(totalSeconds / 3600, 10);
        const minutes = parseInt((totalSeconds % 3600) / 60, 10);
        const seconds = parseInt((totalSeconds % 60), 10);
        let result = "";
        if (hours) {
            result += `${hours} hours, `;
        }
        if (minutes) {
            result += `${minutes} minutes, `;
        }
        if (seconds) {
            result += `${seconds} seconds`;
        }
        return result;
    }
};
