let audio = new Audio('sounds/rooster.mp3');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.greeting === 'start') {

            let units = request.time.split(' ');
            let ints = [];

            for(var i = 0; i < 3; i++) {
                ints[i] = parseInt(units[i]);
            }

            let timer = setTimeout(function() {
                audio.play();
                alert(`Ring ring! Your timer for ${ints[0]} hours, ${ints[1]} minutes, and ${ints[2]} seconds has expired.`);
            }, totalSecs * 1000 + 10);
    
        }
        else if(request.greeting === 'stop') {

        }
    });

function startTimer() {

}