import {
    NavbarView
} from './views/NavbarView/NavbarView.js';
import {
    DriveNowView
} from './views/DriveNowView/DriveNowView.js';

const App = {
    routes: {
        'drive-now': new DriveNowView()
    },

    init() {
        this.navModel = new Backbone.Model('route', 'drive-now');

        _.each(this.routes, (view, route) => {
            view.listenTo(this.navModel, "change", () => {
                if (this.navModel.get('route') === route) {
                    view.render();
                } else {
                    view.remove();
                }
            });
        });

        this.nav = new NavbarView(this.navModel);
        this.nav.render();
    }
};

App.init();