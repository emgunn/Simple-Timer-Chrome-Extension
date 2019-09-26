let countDown = 0;
let audio = new Audio('sounds/rooster.mp3');
let timer;
let running;

chrome.runtime.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function() {

        chrome.storage.local.get(['timeLeft'], function(data) {
            countDown = data.timeLeft

            console.log(countDown);

        });

        chrome.storage.local.get(['running'], function(data) {
            running = data.running;

            console.log(running);
        }) 
    });
});

chrome.runtime.onStartup.addListener(function() {

    chrome.storage.local.set({timeLeft: countDown})
    //delete timer

});

chrome.runtime.onMessage.addListener(
    function(request) {

        let countDown = 0;

        chrome.storage.local.get(['timeLeft'], function(result) {
            countDown = result.timeLeft;
        });

        console.log(countDown);

        if (request.greeting === 'start') {


            let units = secondsToTime(countDown).split(' ');
            let ints = [];

            for(var i = 0; i < 3; i++) {
                ints[i] = parseInt(units[i]);
            }

            let timer = setTimeout(function() {
                audio.play();
                alert(`Ring ring! Your timer for ${ints[0]} hours, ${ints[1]} minutes, and ${ints[2]} seconds has expired.`);
            }, countDown * 1000 + 10);
    
        }
        else if(request.greeting === 'stop') {

        }
    });

function secondsToTime(seconds) {

    let remaining = seconds;

    if(isNaN(seconds)) {
        return null;
    }
    else if(seconds < 0) {
        return null;
    }
    else {
        let h = Math.floor(seconds / 3600);
        remaining = seconds - (h * 3600);

        let m = Math.floor(remaining / 60);
        remaining = remaining - (m * 60);

        let s = remaining;

        return '' + h + ' ' + m + ' ' + s;
    }
}