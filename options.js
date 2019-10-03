let apply = document.getElementById('apply');

let colorSelect = document.getElementById('color');
let soundSelect = document.getElementById('sound');

apply.onclick = saveSettings;

function saveSettings() {
    
    let color = colorSelect.value;
    let sound = soundSelect.value;

    chrome.storage.local.set({color: color, sound: sound}, function() {

        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1000);

        chrome.runtime.sendMessage({action: 'settings'}, function() {
        });
    });
}