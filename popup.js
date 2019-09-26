// references to DOM elements
let title = document.getElementById('title');
let image = document.getElementById('image');
let inputDiv = document.getElementById('input');
let hours = document.getElementById('hours');
let minutes = document.getElementById('minutes');
let seconds = document.getElementById('seconds');
let error = document.getElementById('error');
let button = document.getElementById('startButton');

let audio = new Audio('sounds/rooster.mp3');

let timer;
let interval;
let alarm;
let countDown = 0;
let running;

let numHours = 0;
let numMins = 0;
let numSecs = 0;

chrome.alarms.onAlarm.addListener(function(alarm) {
    audio.play();
    alert(`Ring ring! Your timer for ${numHours} hours, ${numMins} minutes, and ${numSecs} seconds has expired.`, countDown * 1000 + 10);
});

chrome.storage.local.get(['timeLeft'], function(result) {
    countDown = result.timeLeft;

    if(countDown === null) {
        countDown = 0;
    }
});

console.log(countDown);

chrome.storage.local.get(['running'], function(result) {
    runnning = result.running;


});

let port = chrome.extension.connect();

port.onDisconnect.addListener(function() {
    chrome.storage.local.set({timeLeft: countDown});
})

let timeElapsed = 0;

let currTime = secondsToTime(countDown);

let times = currTime.split(' ');

hours.value = times[0];
minutes.value = times[1];
seconds.value = times[2];

button.onclick = startTimer;

if(running) {
    startTimer();
}


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
        console.log('Total seconds = ' + totalSecs);

        // timer = setTimeout(function() {
        //     audio.play();
        //     alert(`Ring ring! Your timer for ${numHours} hours, ${numMins} minutes, and ${numSecs} seconds has expired.`);
        // }, totalSecs * 1000 + 10);

        //use Chrome alarm API
        let alarmTime = Date.now() + (totalSecs * 1000);
        chrome.alarms.create('Simple Timer', {when: alarmTime});

        //set running to true to pass to background
        chrome.storage.local.set({running: true});

        button.onclick = stopTimer;
        button.innerHTML = 'Stop Timer';

        countDown = totalSecs;

        //count one second every 1000 ms
        interval = setInterval(countSecond, 1000);

    }
}

function stopTimer() {
    clearTimeout(timer);
    clearInterval(interval);

    error.innerHTML = 'Timer has been stopped';

    hours.readOnly = false;
    minutes.readOnly = false;
    seconds.readOnly = false;

    button.onclick = startTimer;
    button.innerHTML = 'Start Timer';

    chrome.storage.local.set({timeLeft: countDown});
    chrome.storage.local.set({running: false});
}


function countSecond() {

    if(countDown <= 0) {
        clearInterval(interval);

        seconds.value = 0;

        error.innerHTML = 'Timer has finished';

        hours.readOnly = false;
        minutes.readOnly = false;
        seconds.readOnly = false;

        button.onclick = startTimer;
        button.innerHTML = 'Start Timer'
    }
    else {

        if(seconds.value > 0) {
            seconds.value--;
        }
        else {
            seconds.value = 59;

            if(minutes.value > 0) {
                minutes.value--;
            }
            else {
                hours--;
                minutes.value = 59;
            }
        }

        console.log(countDown);
        chrome.storage.local.set({timeLeft: countDown});
        countDown--;
        timeElapsed++;
    }
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