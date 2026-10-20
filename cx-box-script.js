/*
 * Creative Experience Scripted Actor (Logic Actors > Create Scripted Actor), paste this whole file in.
 * Moves the actor named BOX_NAME by STEP_MM along X each time button.html sends MOVE_BOX.
 * Press M while the experience plays to test the move on its own, without the web page.
 */
var BOX_NAME = 'TestGateActor';
var TOPIC = 'vip.boxtest';
var STEP_MM = 100;
var M_KEY = 77;

var box = null;

function moveBox() {
    if (!box) {
        console.log('[BoxTest] No actor named "' + BOX_NAME + '" was found; rename your box or change BOX_NAME.');
        return;
    }
    var p = box.getPosition();
    box.setPosition(new DSMath.Vector3D(p.x + STEP_MM, p.y, p.z));
    console.log('[BoxTest] Box moved to x=' + (p.x + STEP_MM));
}

function onCommand(data) {
    console.log('[BoxTest] Received: ' + JSON.stringify(data));
    if (data && data.action === 'MOVE_BOX') moveBox();
}

function onWindowMessage(e) {
    if (e.data && e.data.source === 'vip-boxtest') onCommand(e.data);
}

beScript.onStart = function () {
    box = STU.Experience.getCurrent().getActorByName(BOX_NAME, true);
    console.log('[BoxTest] Box found: ' + !!box);
    console.log('[BoxTest] Environment: window=' + typeof window + ', require=' + typeof require +
        ', fetch=' + typeof fetch + ', XMLHttpRequest=' + typeof XMLHttpRequest);

    // PlatformAPI subscriptions outlive a play session, so subscribe once and route to the latest handler.
    STU.boxTestHandler = onCommand;
    if (STU.boxTestSubscribed) {
        console.log('[BoxTest] Already subscribed to "' + TOPIC + '"');
    } else if (typeof require === 'function') {
        try {
            require(['DS/PlatformAPI/PlatformAPI'], function (PlatformAPI) {
                PlatformAPI.subscribe(TOPIC, function (data) { STU.boxTestHandler(data); });
                STU.boxTestSubscribed = true;
                console.log('[BoxTest] Subscribed with PlatformAPI to "' + TOPIC + '"');
            }, function (err) {
                console.log('[BoxTest] PlatformAPI could not be loaded: ' + ((err && err.message) || err));
            });
        } catch (e) {
            console.log('[BoxTest] require() failed: ' + e);
        }
    } else {
        console.log('[BoxTest] No require(): PlatformAPI is not reachable from this player.');
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('message', onWindowMessage);
        console.log('[BoxTest] Also listening for window messages');
    }
};

beScript.onAllKeyboardRelease = function (iEvent) {
    console.log('[BoxTest] Key released: ' + iEvent.key);
    if (iEvent.key === M_KEY) moveBox();
};

beScript.onStop = function () {
    if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('message', onWindowMessage);
};

beScript.execute = function (context) {
};
