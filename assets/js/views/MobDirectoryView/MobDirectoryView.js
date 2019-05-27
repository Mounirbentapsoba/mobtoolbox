import {
    MobService
} from '/assets/js/services/MobService/MobService.js';

export const MobDirectoryView = Backbone.View.extend({
    el: '#main',
    data: {},
    template: 'views/MobDirectoryView/MobDirectoryView.html',
    templateCache: null,

    initData() {
        this.data = JSON.parse(localStorage.getItem('mobs'));
        if (!this.data || !Object.keys(this.data).length) {
            this.data = {};
        }
    },

    saveData() {
        localStorage.setItem('mobs', JSON.stringify(this.data));
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
        this.renderMobMemberInput();
        this.renderKeys();
    },

    renderMobNameInput() {
        const $nameInput = $('#mob-name-input');
        $nameInput.keyup((e) => {
            var code = e.which;
            if (code == 13) {
                e.preventDefault();
                this.data[$nameInput.val()] = [];
                $nameInput.val('');
                this.renderKeys();
                this.saveData();
            }
        });
    },

    renderMobMemberInput() {
        const $member = $('#mob-members-input', this.$el);
        $member.keyup((e) => {
            var code = e.which;
            if (code == 13) {
                e.preventDefault();
                this.data[this.currentlySelectedMob].push({
                    mobMember: $member.val(),
                    startTime: new Date(),
                    stopTime: null
                });
                $member.val('');
                this.renderGrid(this.data[this.currentlySelectedMob]);
                this.saveData();
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

        Object.keys(this.data).forEach((mob) => {
            let $row = $('<tr></tr>');
            $row.click(() => {
                this.currentlySelectedMob = mob;
                if (this.previouslySelected) {
                    this.previouslySelected.removeClass('active');
                }
                $row.addClass('active');
                this.previouslySelected = $row;
                this.renderGrid(this.data[mob]);
                $('#mob-members-input', this.$el).attr('disabled', false);
            });
            $row.append(`<th scope="row">${mob}</th>`);
            $body.prepend($row);
        });
    },

    renderGrid(records) {
        const $table = $('.mob-history', this.$el);
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

        records.forEach((myLog) => {
            let $row = $('<tr></tr>');
            $row.append(`<th scope="row">${myLog.mobMember}</th>`);
            $row.append(`<td>${myLog.startTime}</td>`);
            $row.append(`<td>${myLog.stopTime}</td>`);
            let duration = "ongoing";
            if (myLog.startTime && myLog.stopTime) {
                duration = MobService.formatSeconds((new Date(myLog.stopTime) - new Date(myLog.startTime))/1000);
            }
            $row.append(`<td>${duration}</td>`);
            $body.prepend($row);
        });
    }
});