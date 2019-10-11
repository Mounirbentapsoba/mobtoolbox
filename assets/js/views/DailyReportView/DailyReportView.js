import {
    MobService
} from '../../services/MobService/MobService.js';

export const DailyReportView = Backbone.View.extend({
    el: '#main',
    data: {},
    template: 'views/DailyReportView/DailyReportView.html',
    templateCache: null,
    events: {
        'click #save-report': 'saveReport',
        'click #delete-report': 'deleteReport'
    },
    initData() {
        this.data = JSON.parse(localStorage.getItem('daily-reports'));
        if (!this.data || !Object.keys(this.data).length) {
            this.data = {
                reports: []
            };
        }
    },

    saveData() {
        localStorage.setItem('daily-reports', JSON.stringify(this.data));
    },

    render() {
        if (this.templateCache) {
            this.doRender();
            return this;
        }

        MobService.getTemplate(this.template).then((html) => {
            this.templateCache = _.template(html);
            this.doRender();
        });
        return this;
    },

    doRender() {
        $(this.el).html(this.templateCache);
        this.initData();
        this.renderReports();
    },

    renderReports() {
        const $list = $('#reports', this.$el);
        $list.empty();

        this.data.reports.forEach((report) => {
            const lines = report.split('\n');
            if (lines.length === 0) {
                return;
            }
            const first = report.split('\n')[0];
            const $row = $(`<button type="button" class="list-group-item list-group-item-action">${first}</button>`);
            $row.click(() => {
                this.currentlySelectedReport = report;
                if (this.previouslySelected) {
                    this.previouslySelected.removeClass('active');
                }
                $row.addClass('active');
                $('#delete-report').removeClass('disabled');
                this.previouslySelected = $row;
                $('#current-report').val(report);
            });
            $list.prepend($row);
        });
    },

    saveReport() {
        const $current = $('#current-report');
        if (!this.data.reports) {
            this.data.reports = [];
        }
        this.data.reports.push($current.val());
        $current.val('');
        this.saveData();
        this.renderReports();
    },

    deleteReport() {
        if (!this.currentlySelectedReport) {
            return;
        }
        const kept = [];
        this.data.reports.forEach((report) => {
            if (report !== this.currentlySelectedReport) {
                kept.push(report);
            }
        });
        this.data.reports = kept;
        this.saveData();
        this.renderReports();
        $('#current-report').val('');
        $('#delete-report').addClass('disabled');
    }

});