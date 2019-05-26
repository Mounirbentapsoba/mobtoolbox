import {
    MobService
} from '/assets/js/services/MobService/MobService.js';

export const DriverLogsView = Backbone.View.extend({
    el: '#main',
    data: [],
    template: 'views/DriverLogsView/DriverLogsView.html',
    templateCache: null,

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
        this.renderKeys();
    },

    initData() {
        this.data = JSON.parse(localStorage.getItem('logs_backups'));
        if (!this.data || !this.data.length) {
            this.data = [];
        }
    },

    renderKeys() {
        const $table = $('.historical-logs', this.$el);
        $table.empty();

        const $head = $('<thead></thead>');
        const $header = $('<tr></tr>');
        $header.append('<th scope="col">Timestamp</th>');
        $head.append($header);
        $table.append($head);

        const $body = $('<tbody></tbody>');
        $table.append($body);

        this.data.forEach((historical) => {
            let $row = $('<tr></tr>');
            $row.click(() => {
                if (this.previouslySelected) {
                    this.previouslySelected.removeClass('active');
                }
                $row.addClass('active');
                this.previouslySelected = $row;
                this.renderGrid(historical.logs);
            });
            $row.append(`<th scope="row">${historical.key}</th>`);
            $body.prepend($row);
        });
    },

    renderGrid(logs) {
        const $table = $('.selected-log', this.$el);
        $table.empty();

        const $head = $('<thead></thead>');
        const $header = $('<tr></tr>');
        $header.append('<th scope="col">Member</th>');
        $header.append('<th scope="col">Start</th>');
        $header.append('<th scope="col">Stop</th>');
        $header.append('<th scope="col">Duration</th>');
        $head.append($header);
        $table.append($head);

        const $body = $('<tbody></tbody>');
        $table.append($body);

        logs.forEach((myLog) => {
            let $row = $('<tr></tr>');
            $row.append(`<th scope="row">${myLog.mobMember}</th>`);
            $row.append(`<td>${myLog.startTime}</td>`);
            $row.append(`<td>${myLog.stopTime}</td>`);
            $row.append(`<td>${MobService.formatSeconds((new Date(myLog.stopTime) - new Date(myLog.startTime))/1000)}</td>`);
            $body.prepend($row);
        });
    }
});