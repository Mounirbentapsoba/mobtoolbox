  $(function() {

    let notifications = false;
    let lastNotificationTime = null;
    let mobMinutes = $('#timer-input').val();
    let startTime = null;
    let stopTime = null;
    let logs = [];

    const title = $('<title></title>');

    init();

    $('head').append(title);

    $('#timer-input').change(() => {
        mobMinutes = $('#timer-input').val();
    });

    $('#build-url').click(() => {
        console.log(window.location.host + window.location.pathname + "?logs=" + encodeURI(JSON.stringify(logs)));
    });

    $('#mob-members-input').keyup(function(e){
        var code = e.which;
        if(code==13) {
          e.preventDefault();
          addMember($(this).val());
          $(this).val('');
        }
    });

    $('#start-timer').click(function(){
      startTime = new Date();
      stopTime = null;
      $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon_running.ico");
      timer();
    });

    $('#stop-timer').click(function(){
      $('head link[rel="shortcut icon"]').attr('href', "assets/images/favicon.ico");
      const mobMember = $('#mob-members-list li.selected').text();
      if (!mobMember) {
        console.log('no mobMember selected');
        return;
      }
      stopTime = new Date();
      logs.push({ startTime, stopTime, mobMember });
      updateFromLogs();
      startTime = null;
    });

    function init() {
        initializeNotifications();
        initializeLogs();
    }

    function initializeNotifications() {
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                notifications = true;
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        notifications = true;
                    }
                });
            }
        }
    }

    function initializeLogs() {
        const args = window.location.search.replace("?", "").split("&");
        args.forEach((arg) => {
          keyVal = arg.split("=");
          if (keyVal[0] === "logs") {
            backup = localStorage.getItem('logs');
            const now = new Date();
            const key = `logs_backup_${now.toISOString()}`;
            localStorage.setItem(key, backup);
            console.log(`we did a backup in localStorage just in case with key:${key}`);
            logs = JSON.parse(decodeURI(keyVal[1]));
            sanitizeLogDates();
            updateMembers();
            updateFromLogs();
          }
        });

        if (!logs.length) {
          logs = JSON.parse(localStorage.getItem('logs'));
          if (logs) {
            sanitizeLogDates();
            updateMembers();
            updateFromLogs();
          }
        }
    }

    function timer() {
      const now = new Date();
      const diff = now - startTime;
      title.text(parseInt(diff/1000, 10));
      if (mobMinutes && diff > mobMinutes * 60 * 1000) {
          if (notifications) {
              if (!lastNotificationTime || now - lastNotificationTime > 30000) {
                  new Notification("Mob session is over.  Change drivers.");
                  lastNotificationTime = new Date();
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
        if (startTime) {
          timer();
        }
      }, 500);
    }

    function sanitizeLogDates() {
      logs.forEach((log) => {
        log.startTime = new Date(log.startTime);
        log.stopTime = new Date(log.stopTime);
      });
    }

    function updateMembers() {
      $("#mob-members-list").empty();
      const members = {};
      logs.forEach((log) => {
        members[log.mobMember] = true;
      });
      Object.keys(members).forEach((member) => {
        addMember(member);
      });
    }

    function addMember(name) {
      const $li = $('<li class="btn mob-member"></li>');
      $li.click(function(){
        $('li.mob-member').removeClass('selected');
        $(this).addClass('selected');
      });
      $li.html(name);
      $("#mob-members-list").append($li);
    }

    function updateFromLogs() {
      localStorage.setItem('logs', JSON.stringify(logs));
      updateGrid();
      updateTotal();
    }

    function updateGrid() {
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

        logs.forEach((myLog) => {
          let $row = $('<tr></tr>');
          $row.append(`<th scope="row">${myLog.mobMember}</th>`);
          $row.append(`<td>${myLog.startTime.toISOString()}</td>`);
          $row.append(`<td>${myLog.stopTime.toISOString()}</td>`);
          $row.append(`<td>${formatSeconds((myLog.stopTime - myLog.startTime)/1000)}</td>`);
          $body.prepend($row);
        });
    }

    function updateTotal() {
        let current = 0;
        logs.forEach((myLog) => {
            current += (myLog.stopTime - myLog.startTime)/1000;
        });
        current = parseInt(current, 10);
        $('#total-seconds').text('total seconds: ' + parseInt(current, 10));
        $('#total-seconds-formatted').text(formatSeconds(current));
    }

    function formatSeconds(totalSeconds) {
      const hours = parseInt(totalSeconds/3600, 10);
      const minutes = parseInt((totalSeconds % 3600)/60, 10);
      const seconds = parseInt((totalSeconds % 60), 10);
      let result = "";
      if (hours) {
        result += `${hours} hours, `;
      }
      if (minutes) {
        result += `${minutes} minutes, `;
      }
      if (seconds) {
        result += `${seconds} seconds`;
      }
      return result;
    }

  });
