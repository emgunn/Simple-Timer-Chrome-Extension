// references to DOM elements
let title = document.getElementById('title');
let image = document.getElementById('image');
let inputDiv = document.getElementById('input');
let hours = document.getElementById('hours');
let minutes = document.getElementById('minutes');
let seconds = document.getElementById('seconds');
let error = document.getElementById('error');
let button = document.getElementById('startButton');
let clear = document.getElementById('clearButton');

let alarm;
let countDown = 0;
let running;

let startTime;

let numHours;
let numMins;
let numSecs;

chrome.storage.local.get(['hours'], function(result) {
    hours.value = result.hours;
});
chrome.storage.local.get(['minutes'], function(result) {
    minutes.value = result.minutes;
});
chrome.storage.local.get(['seconds'], function(result) {
    seconds.value = result.seconds;
});
chrome.storage.local.get(['running'], function(result) {
    running = result.running;
    console.log('App is running: ' + running);
});

if(running) {
    button.innerHTML = 'Stop Timer';
    button.onclick = stopTimer;
}
else {
    button.innerHTML = 'Start Timer';
    button.onclick = startTimer;
}
clear.onclick = clearTimer;

chrome.storage.local.get(['timeLeft'], function(result) {
    countDown = result.timeLeft;

    if(countDown == null) {
        countDown = 0;
    }
});

console.log(countDown);


let port = chrome.extension.connect();

chrome.runtime.onMessage.addListener(function(message) {
    if(message['action'] == 'set') {
        hours.value = message['hours'];
        minutes.value = message['minutes'];
        seconds.value = message['seconds'];

        alert('messaged from background received');
    }

    else if(message['action'] == 'update') {
        hours.value = message['hours'];
        minutes.value = message['minutes'];
        seconds.value = message['seconds'];
    }

    else if(message['action'] == 'end') {
        hours.value = null;
        minutes.value = null;
        seconds.value = null;

        stopTimer();
    }
})

port.onDisconnect.addListener(function() {
    chrome.storage.local.set({timeLeft: countDown});
})

function startTimer() {
    numHours = hours.value;
    numMins = minutes.value;
    numSecs = seconds.value;

    if(isNaN(numHours) || isNaN(numMins) || isNaN(numSecs)) {
        error.innerHTML = 'Please enter valid numbers only';

    }
    else {
        if(!hours.value) {
            numHours = 0;
            hours.value = 0;
        }
        if(!minutes.value) {
            numMins = 0;
            minutes.value = 0;
        }
        if(!seconds.value) {
            numSecs = 0;
            seconds.value = 0;
        }

        hours.readOnly = true;
        minutes.readOnly = true;
        seconds.readOnly = true;

        error.innerHTML = '';
        totalSecs = (numHours * 3600) + (numMins * 60) + (numSecs * 1);
        console.log('Total seconds: ' + totalSecs);

        let stopped;
        chrome.storage.local.get(['stopped'], function(result) {
            stopped = result.stopped;
        });

        if(stopped) {
            chrome.runtime.sendMessage({action: 'resume', hours: numHours, minutes: numMins, seconds: numSecs}, function() {

            });
        }
        else {
            chrome.runtime.sendMessage({action: 'start', hours: numHours, minutes: numMins, seconds: numSecs}, function() {

            });
        }

        //set running to true to pass to background
        chrome.storage.local.set({running: true});

        button.onclick = stopTimer;
        button.innerHTML = 'Stop Timer';

        countDown = totalSecs;
    }
}

function stopTimer() {

    error.innerHTML = 'Timer has been stopped';

    hours.readOnly = false;
    minutes.readOnly = false;
    seconds.readOnly = false;

    button.onclick = startTimer;
    button.innerHTML = 'Start Timer';

    //set running to false
    chrome.storage.local.set({timeLeft: countDown, running: false, stopped: true});

    chrome.runtime.sendMessage({action: 'stop'});
}

function clearTimer() {
    error.innerHTML = 'Timer cleared';

    hours.value = null;
    minutes.value = null;
    seconds.value = null;
    hours.readOnly = false;
    minutes.readOnly = false;
    seconds.readOnly = false;

    button.onclick = startTimer;
    button.innerHTML = 'Start Timer';

    chrome.storage.local.set({hours: null, minutes: null, seconds: null, running: false, stopped: false});
    chrome.runtime.sendMessage({action: 'clear'});
}

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

//requires format: 'h m s'
function timeToSeconds(time) {

    if(!time instanceof String) {
        console.log('Passed in value must be of string type');
        return 0;
    } 
    else {
        let units = time.split(' ');
        if(units.length != 3) {
            console.log('Passed in string must have 3 space-delimited words');
            return 0;
        }
        else {
            return (parseInt(units[0]) * 3600) + (parseInt(units[1] * 60)) + (parseInt(units[2])); 
        }
    }
}