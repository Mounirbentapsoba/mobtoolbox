import {
    TemplateService
} from '/assets/js/services/TemplateService/TemplateService.js';

export const NavbarView = Backbone.View.extend({
    el: '.NavbarView',
    template: 'views/NavbarView/NavbarView.html',
    initialize(model) {
        this.model = model;
    },
    render() {
        TemplateService.getTemplate(this.template).then((html) => {
            $(this.el).html(_.template(html));
            this.model.set('route', 'drive-now');
        });
        return this;
    }
});