import {
    MobService
} from '/assets/js/services/MobService/MobService.js';

export const NavbarView = Backbone.View.extend({
    el: '.NavbarView',
    template: 'views/NavbarView/NavbarView.html',
    events: {
        'click .nav-link[href="#drive-now"]': 'showDriveNow',
        'click .nav-link[href="#driver-logs"]': 'showDriverLogs'
    },
    initialize(model, startRoute) {
        this.model = model;
        this.startRoute = startRoute;
    },
    showDriveNow() {
        this.model.set('route', '#drive-now');
    },
    showDriverLogs() {
        this.model.set('route', '#driver-logs');
    },
    render() {
        MobService.getTemplate(this.template).then((html) => {
            $(this.el).html(_.template(html));
            this.model.set('route', this.startRoute);
        });
        return this;
    }
});