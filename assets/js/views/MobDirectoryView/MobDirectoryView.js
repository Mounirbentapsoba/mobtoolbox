import {
    MobService
} from '/assets/js/services/MobService/MobService.js';

export const MobDirectoryView = Backbone.View.extend({
    el: '#main',
    data: [],
    template: 'views/MobDirectoryView/MobDirectoryView.html',
    templateCache: null,

    initData() {
        this.data = JSON.parse(localStorage.getItem('mobs'));
        if (!this.data || !this.data.length) {
            this.data = [];
        }
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
        this.renderMobNameInput();
        this.renderKeys();
    },

    renderMobNameInput() {
        const $nameInput = $('#mob-name-input');
        $nameInput.keyup((e) => {
            var code = e.which;
            if (code == 13) {
                e.preventDefault();
                this.data.push({
                    key: $nameInput.val(),
                    members: []
                });
                $nameInput.val('');
                this.renderKeys();
            }
        });
    },

    renderKeys() {
        const $table = $('.mobs', this.$el);
        $table.empty();

        const $head = $('<thead></thead>');
        const $header = $('<tr></tr>');
        $header.append('<th scope="col">Team Name</th>');
        $head.append($header);
        $table.append($head);

        const $body = $('<tbody></tbody>');
        $table.append($body);

        this.data.forEach((mob) => {
            let $row = $('<tr></tr>');
            $row.click(() => {
                if (this.previouslySelected) {
                    this.previouslySelected.removeClass('active');
                }
                $row.addClass('active');
                this.previouslySelected = $row;
                this.renderGrid(mob.members);
            });
            $row.append(`<th scope="row">${mob.key}</th>`);
            $body.prepend($row);
        });
    },

    renderGrid(records) {
        // const $table = $('.selected-log', this.$el);
        // $table.empty();

        // const $head = $('<thead></thead>');
        // const $header = $('<tr></tr>');
        // $header.append('<th scope="col">Member</th>');
        // $header.append('<th scope="col">Start</th>');
        // $header.append('<th scope="col">Stop</th>');
        // $header.append('<th scope="col">Duration</th>');
        // $head.append($header);
        // $table.append($head);

        // const $body = $('<tbody></tbody>');
        // $table.append($body);

        // logs.forEach((myLog) => {
        //     let $row = $('<tr></tr>');
        //     $row.append(`<th scope="row">${myLog.mobMember}</th>`);
        //     $row.append(`<td>${myLog.startTime}</td>`);
        //     $row.append(`<td>${myLog.stopTime}</td>`);
        //     $row.append(`<td>${MobService.formatSeconds((new Date(myLog.stopTime) - new Date(myLog.startTime))/1000)}</td>`);
        //     $body.prepend($row);
        // });
    }
});