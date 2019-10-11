import {
    MobService
} from '../../services/MobService/MobService.js';

export const NavbarView = Backbone.View.extend({
    el: '.NavbarView',
    template: 'views/NavbarView/NavbarView.html',
    events: {
        'click .nav-link[href="#drive-now"]': 'showDriveNow',
        'click .nav-link[href="#driver-logs"]': 'showDriverLogs',
        'click .nav-link[href="#mob-directory"]': 'showMobDirectory',
        'click .nav-link[href="#daily-report"]': 'showDailyReport'
    },
    initialize(model, startRoute) {
        this.model = model;
        this.startRoute = startRoute;
    },
    toRoute(route) {
        $('.nav-link').removeClass('active');
        $(`.nav-link[href="${route}"]`).addClass('active');
        this.model.set('route', route);
    },
    showDriveNow() {
        this.toRoute('#drive-now');
    },
    showDriverLogs() {
        this.toRoute('#driver-logs');
    },
    showMobDirectory() {
        this.toRoute('#mob-directory');
    },
    showDailyReport() {
        this.model.set('route', '#daily-report');
    },
    render() {
        MobService.getTemplate(this.template).then((html) => {
            $(this.el).html(_.template(html));
            this.toRoute(this.startRoute);
        });
        return this;
    }
});
