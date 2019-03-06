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
        debugger;
        console.log(encodeURI(JSON.stringify(logs)));
    });
    
    $('#mob-members-input').keyup(function(e){ 
        var code = e.which;
        if(code==13) {
          e.preventDefault();
          const $li = $('<li class="btn mob-member"></li>');
          $li.click(function(){
            $('li.mob-member').removeClass('selected');
            $(this).addClass('selected');
          });
          $li.html($(this).val());
          $(this).val('');
          $("#mob-members-list").append($li);
        }
    });
    
    $('#start-timer').click(function(){
      startTime = new Date();
      stopTime = null;
      $('head link[rel="shortcut icon"]').attr('href', "https://gavinpalmer1984.github.io/mobtoolbox/favicon_running.ico");
      timer();
    });
    
    $('#stop-timer').click(function(){
      $('head link[rel="shortcut icon"]').attr('href', "https://gavinpalmer1984.github.io/mobtoolbox/favicon.ico");
      const mobMember = $('#mob-members-list li.selected').text();
      if (!mobMember) {
        console.log('no mobMember selected');
        return;
      }
      stopTime = new Date();
      logs.push({ startTime, stopTime, mobMember });
      updateGrid();
      updateTotal();
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
        debugger;
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
            $('head link[rel="shortcut icon"]').attr('href', "https://gavinpalmer1984.github.io/mobtoolbox/favicon_alert_alt.ico");
          } else {
            $('head link[rel="shortcut icon"]').attr('href', "https://gavinpalmer1984.github.io/mobtoolbox/favicon_alert.ico");
          }
      }
      setTimeout(() => {
        if (startTime) {
          timer();
        }
      }, 500);
    }
    
    function updateGrid() {
        $('.grid').empty();
        logs.forEach((myLog) => {
            const row = $('<li></li>');
            row.text(myLog.mobMember + " " + (myLog.stopTime - myLog.startTime)/1000);
            $('.grid').append(row);
        });
    }
    
    function updateTotal() {
        let current = 0;
        logs.forEach((myLog) => {
            current += (myLog.stopTime - myLog.startTime)/1000;
        });
        current = parseInt(current, 10);
        $('#total-seconds').text(parseInt(current, 10));
        $('#total-seconds-formatted').text(parseInt(current/3600, 10) + " hours, " + parseInt((current % 3600)/60, 10) + " minutes, " + parseInt((current % 60), 10) + " seconds");
    }

  });
