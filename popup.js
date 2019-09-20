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
let countDown = 0;
let timeElapsed = 0;

button.onclick = startTimer;


function startTimer() {
    let numHours = hours.value;
    let numMins = minutes.value;
    let numSecs = seconds.value;

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

        timer = setTimeout(function() {
            audio.play();
            alert(`Ring ring! Your timer for ${numHours} hours, ${numMins} minutes, and ${numSecs} seconds has expired.`);
        }, totalSecs * 1000 + 10);

        button.onclick = stopTimer;
        button.innerHTML = 'Stop Timer';

        countDown = totalSecs;

        interval = setInterval(countSecond, 1000);

        chrome.runtime.sendMessage(
            {greeting: "start", timeLeft: countDown, time: secondsToTime(countDown)},
            function(response) {
        });
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

    chrome.runtime.sendMessage(
        {greeting: "stop", timeLeft: countDown, time: secondsToTime(countDown)},
        function(response) {
    });
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