/* globals $*/

export const TemplateService = {
    cache: {},
    root: '/assets/js',
    getTemplate(url) {
        return $.get(`${this.root}/${url}`);
    }
};