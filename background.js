chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({hours: null, minutes: null, seconds: null}, function() {
        console.log('Hours, minutes, and seconds initialized.');
    })
});

let audio = new Audio('sounds/rooster.mp3');
chrome.storage.local.get(['sound'], function(data) {
    audio = new Audio(data.sound);
});

let countDown = 0;
let timer;
let running;
let hours, minutes, seconds;

let alarmTime;

let alarm;

let startHours, startMinutes, startSeconds;

let secondsLeft;

let interval;

chrome.storage.local.get(['hours'], function(data) {
    hours = parseInt(data.hours);
});

chrome.storage.local.get(['minutes'], function(data) {
    minutes = parseInt(data.minutes);
});

chrome.storage.local.get(['seconds'], function(data) {
    seconds = parseInt(data.seconds);
});

chrome.storage.local.get(['running'], function(data) {
    running = data.running;
});

chrome.runtime.onConnect.addListener(function(port) {

    port.onDisconnect.addListener(function() {

        // chrome.storage.local.get(['timeLeft'], function(data) {
        //     countDown = data.timeLeft

        //     console.log('countDown: ' + countDown);

        // });

        chrome.storage.local.get(['running'], function(data) {
            running = data.running;

            console.log('is running? ' + running);
        }) 
    });
});

// chrome.runtime.onStartup.addListener(function() {

//     chrome.runtime.sendMessage({action: 'set', hours: hours, minutes: minutes, seconds: seconds});

//     chrome.storage.local.set({hours: hours, minutes: minutes, seconds: seconds});

//     chrome.storage.local.get(['running'], function(data) {
//         running = data.running;

//         console.log('is running? ' + running);
//     }) 
// });

chrome.alarms.onAlarm.addListener(function(alarm) {
    audio.play();
    running = false;

    chrome.storage.local.set({hours: null, minutes: null, seconds: null, running: running, stopped: false});

    alert(`Ring ring! Your timer for ${startHours} hours, ${startMinutes} minutes, and ${startSeconds} seconds has expired.`, countDown * 1000 + 10);
});


chrome.runtime.onMessage.addListener(function(message) {

        console.log(countDown);

        if(message['action'] == 'start') {
            startHours = parseInt(message['hours']);
            startMinutes = parseInt(message['minutes']);
            startSeconds = parseInt(message['seconds']);
            secondsLeft = (startHours * 3600) + (startMinutes * 60) + (startSeconds * 1);

            running = true;
            chrome.storage.local.set({running: running});

            console.log('SECONDS LEFT: ' + secondsLeft);
            interval = setInterval(countSecond, 1000);

             //use Chrome alarm API
            alarmTime = Date.now() + (secondsLeft * 1000);
            chrome.alarms.create('Simple Timer', {when: alarmTime});
        }
        else if(message.action == 'stop') {
            clearInterval(interval);
            chrome.alarms.clearAll(function() {

            });
            running = false;
            chrome.storage.local.set({running: running, stopped: true});
        }

        else if(message.action == 'resume') {
            alarmTime = Date.now() + (secondsLeft * 1000);
            chrome.alarms.create('Simple Timer', {when: alarmTime});
            interval = setInterval(countSecond, 1000);

            running = true;
            chrome.storage.local.set({running: running});
        }

        else if(message.action == 'clear') {
            clearInterval(interval);
            chrome.alarms.clearAll(function() {

            });
            running = false;
            chrome.storage.local.set({running: running, stopped: false});
        }

        else if(message.action == 'settings') {
            chrome.storage.local.get(['sound'], function(data) {
                audio = new Audio(data.sound);
            });
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


function countSecond() {
    if(secondsLeft <= 0) {
        console.log('Time left: ' + secondsLeft + ' seconds');
        clearInterval(interval);

        chrome.runtime.sendMessage({action: 'end'}, function(){

        });

        return;
    }

    secondsLeft--;

    let units = secondsToTime(secondsLeft).split(' ');
    hours = units[0];
    minutes = units[1];
    seconds = units[2];

    chrome.runtime.sendMessage({action: 'update', hours: hours, minutes: minutes, seconds: seconds});

    chrome.storage.local.set({hours: hours, minutes: minutes, seconds: seconds})
    
    console.log('Time left: ' + secondsLeft + ' seconds');
}