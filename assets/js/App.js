import {
    NavbarView
} from './views/NavbarView/NavbarView.js';

import {
    DriveNowView
} from './views/DriveNowView/DriveNowView.js';

import {
    DriverLogsView
} from './views/DriverLogsView/DriverLogsView.js';

import {
    MobDirectoryView
} from './views/MobDirectoryView/MobDirectoryView.js';

import {
    DailyReportView
} from './views/DailyReportView/DailyReportView.js';

const App = {
    routes: {
        '#drive-now': new DriveNowView(),
        '#driver-logs': new DriverLogsView(),
        '#mob-directory': new MobDirectoryView(),
        '#daily-report': new DailyReportView()
    },

    init() {
        this.navModel = new Backbone.Model();
        this.navModel.on("change", (model) => {
            this.routes[model.get('route')].render();
        });

        let startRoute = '#drive-now';
        if (window.location.hash) {
            startRoute = window.location.hash;
        }

        this.nav = new NavbarView(this.navModel, startRoute);
        this.nav.render();
    }
};

App.init();