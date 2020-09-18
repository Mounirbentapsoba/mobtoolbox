import {
    MobService
} from '../../services/MobService/MobService.js';

export const DriveNowView = Backbone.View.extend({
    el: '#main',
    notifications: false,
    lastNotificationTime: null,
    mobMinutes: $('#timer-input').val(),
    startTime: null,
    stopTime: null,
    logs: [],
    mobsMap: JSON.parse(localStorage.getItem('mobs')),
    mobs() {
        return this.mobsMap ? Object.keys(this.mobsMap): [];
    },
    title: $('<title></title>'),
    template: 'views/DriveNowView/DriveNowView.html',
    events: {
        'click .save-log': 'saveLogs',
        'click .new-log': 'clearLogs'
    },
    saveLogs() {
        const backup = localStorage.getItem('logs');
        const now = new Date();
        const key = `logs_backup_${now.toISOString()}`;
        localStorage.setItem(key, backup);

        let backups = JSON.parse(localStorage.getItem('logs_backups'));
        if (!backups || !backups.length) {
            backups = [];
        }

        const historical = {
            logs: JSON.parse(backup),
            key: now.toISOString()
        };
        backups.push(historical);
        localStorage.setItem('logs_backups', JSON.stringify(backups));
    },

    clearLogs() {
        this.startTime = null;
        this.stopTime = null;
        this.logs = [];
        this.updateFromLogs();
    },

    backend() {
        console.log('backend is available');
        this.socket = io({
            transports: ['websocket']
        });
        this.socket.on('start timer', (msg) => {
            if (this.startTime === null) {
                this.onStartTimer(new Date(msg.startTime));
            }
            if (this.logs.length === 0) {
                this.logs = msg.logs;
                this.updateFromLogs();
            }
        });
        this.socket.on('stop timer', (msg) => {
            if (this.logs.length === 0) {
                this.logs = msg.logs;
                this.updateFromLogs();
            }
            if (this.startTime !== null) {
                this.onStopTimer(msg.mobMember, new Date(msg.stopTime));
            }
        });
        this.socket.on('bad secret', (msg) => {
            console.error('someone tried to use the wrong secret');
        });
    },

    render() {
        $.get('/api/version').then((result) => this.backend(), (err) => console.error('version error', err) );

        MobService.getTemplate(this.template).then((html) => {
            $(this.el).html(_.template(html));
            this.renderMobDropdown();
            this.oldRender();
            this.initializeNotifications();
            this.initializeLogs();
        });
        return this;
    },

    onStartTimer(startTime) {
        this.startTime= startTime;
        this.stopTime = null;
        $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon_running.ico");
        this.timer();
        $('#start-timer').addClass('disabled');
        $('#stop-timer').removeClass('disabled');
    },

    onStopTimer(mobMember, stopTime) {
        $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon.ico");
        if (!this.logs || !this.logs.length) {
            this.logs = [];
        }

        this.stopTime = stopTime;
        this.logs.push({
            startTime: this.startTime,
            stopTime: this.stopTime,
            mobMember
        });

        this.updateFromLogs();
        this.startTime = null;
        $('#stop-timer').addClass('disabled');
        $('#start-timer').removeClass('disabled');
    },

    renderMobDropdown() {
        const $drop = $('.mobs-dropdown .dropdown-menu', this.$el);
        this.mobs().forEach((mob) => {
            const $a = $(`<a class="dropdown-item" href="#">${mob}</a>`);
            $drop.append($a);
            $a.click(() => {
                $("#mob-members-list").empty();
                this.mobsMap[mob].forEach((record) => {
                    this.addMember(record.mobMember);
                });
            });
        });
    },

    oldRender() {
        $('head').append(this.title);

        $('#timer-input').change(() => {
            this.mobMinutes = $('#timer-input').val();
        });

        $('#build-url').click(() => {
            console.log(window.location.host + window.location.pathname + "?logs=" + encodeURI(JSON.stringify(this.logs)));
        });

        const $memberInput = $('#mob-members-input');
        $memberInput.keyup((e) => {
            var code = e.which;
            if (code == 13) {
                e.preventDefault();
                this.addMember($memberInput.val());
                $memberInput.val('');
            }
        });

        $('#start-timer').click(() => {
            this.onStartTimer(new Date());
            this.socket.emit('start timer', {
                startTime: this.startTime,
                logs: this.logs,
                secret: $('#secret').val()
            });
        });

        $('#stop-timer').click(() => {
            const mobMember = $('#mob-members-list li.selected').text();
            if (!mobMember) {
                console.log('no mobMember selected');
                $('.toast').toast('show')
                return;
            }
            this.onStopTimer(mobMember, new Date());
            this.socket.emit('stop timer', {
                logs: this.logs,
                stopTime: this.stopTime,
                mobMember: mobMember,
                secret: $('#secret').val()
            });
        });
    },

    initializeNotifications() {
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                this.notifications = true;
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        this.notifications = true;
                    }
                });
            }
        }
    },

    initializeLogs() {
        const args = window.location.search.replace("?", "").split("&");
        args.forEach((arg) => {
            const keyVal = arg.split("=");
            if (keyVal[0] === "logs") {
                backup = localStorage.getItem('logs');
                const now = new Date();
                const key = `logs_backup_${now.toISOString()}`;
                localStorage.setItem(key, backup);
                console.log(`we did a backup in localStorage just in case with key:${key}`);
                this.logs = JSON.parse(decodeURI(keyVal[1]));
                this.updateFromLogs();
            }
        });

        if (!this.logs.length) {
            this.logs = JSON.parse(localStorage.getItem('logs'));
            if (this.logs && this.logs.length) {
                this.updateFromLogs();
            } else {
                this.logs = [];
            }
        }
    },

    timer() {
        const now = new Date();
        const diff = now - this.startTime;
        this.title.text(parseInt(diff / 1000, 10));
        if (this.mobMinutes && diff > this.mobMinutes * 60 * 1000) {
            if (this.notifications) {
                if (!this.lastNotificationTime || now - this.lastNotificationTime > 30000) {
                    new Notification("Mob session is over.  Change drivers.");
                    this.lastNotificationTime = new Date();
                }
            }
            const audio = $('#easy-audio')[0];
            audio.play();

            if ($('head link[rel="shortcut icon"]').attr('href').indexOf("favicon_alert_alt.ico") === -1) {
                $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon_alert_alt.ico");
            } else {
                $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon_alert.ico");
            }
        }
        setTimeout(() => {
            if (this.startTime) {
                this.timer();
            }
        }, 500);
    },

    sanitizeLogDates() {
        this.logs.forEach((log) => {
            log.startTime = new Date(log.startTime);
            log.stopTime = new Date(log.stopTime);
        });
    },

    updateMembers() {
        $("#mob-members-list").empty();
        const members = {};
        this.logs.forEach((log) => {
            members[log.mobMember] = true;
        });
        Object.keys(members).forEach((member) => {
            this.addMember(member);
        });
    },

    addMember(name) {
        const $li = $('<li class="btn mob-member"></li>');
        $li.click(() => {
            $('li.mob-member').removeClass('selected');
            $li.addClass('selected');
        });
        $li.html(name);
        $("#mob-members-list").append($li);
    },

    updateFromLogs() {
        localStorage.setItem('logs', JSON.stringify(this.logs));
        this.sanitizeLogDates();
        this.updateMembers();
        this.updateGrid();
        this.updateTotal();
    },

    updateGrid() {
        const $table = $('#logs');
        $table.empty();

        const $head = $('<thead></thead>');
        let $header = $('<tr></tr>');
        $header.append('<th scope="col">Member</th>');
        $header.append('<th scope="col">Start</th>');
        $header.append('<th scope="col">Stop</th>');
        $header.append('<th scope="col">Duration</th>');
        $head.append($header);
        $table.append($head);

        const $body = $('<tbody></tbody>');
        $table.append($body);

        this.logs.forEach((myLog) => {
            let $row = $('<tr></tr>');
            $row.append(`<th scope="row">${myLog.mobMember}</th>`);
            $row.append(`<td>${myLog.startTime.toISOString()}</td>`);
            $row.append(`<td>${myLog.stopTime.toISOString()}</td>`);
            $row.append(`<td>${MobService.formatSeconds((myLog.stopTime - myLog.startTime)/1000)}</td>`);
            $body.prepend($row);
        });
    },

    updateTotal() {
        let current = 0;
        this.logs.forEach((myLog) => {
            current += (myLog.stopTime - myLog.startTime) / 1000;
        });
        current = parseInt(current, 10);
        $('#total-seconds').text('total seconds: ' + parseInt(current, 10));
        $('#total-seconds-formatted').text(MobService.formatSeconds(current));
    }

});
