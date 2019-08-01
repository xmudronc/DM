var running = false;
var action = false;
var holding = false;
var dev = false;
var devEvents;
var shotgun;
var chainsaw;
var fist;
var level;
var currentEnemy;
var score;
var sawStart;
var sawTime;
var imp;

document.addEventListener("keydown", function (key) {
    if (key.code == 'Escape') {
        giveUp();
        saveDevEvents();
    } else if (key.code == 'Space') {
        chainsawGo();
    } else if (key.code == 'KeyD') {
        fireR();
    } else if (key.code == 'KeyA') {
        fireL();
    }
});

document.addEventListener("keyup", function (key) {
    if (key.code == 'Space') {
        chainsawStop();
    }
});

document.getElementById('control-layer-c').addEventListener('mousedown', function (event) {
    chainsawGo();
});

document.getElementById('control-layer-c').addEventListener('mouseup', function (event) {
    chainsawStop();
});

document.getElementById('control-layer-c').addEventListener('touchstart', function (event) {
    chainsawGo();
});

document.getElementById('control-layer-c').addEventListener('touchend', function (event) {
    chainsawStop();
});

function fireR() {
    fireDevEvent('shotgun');
    if (running) {
        if (!action) {
            action = true;
            console.log("BANG");
            kill('shotgun');
            shotgun.play();
            document.getElementById('player-layer-0').style.animation = '1.0s shotgun';
            setTimeout(function () {
                document.getElementById('player-layer-0').style.animation = undefined;
                action = false;
            }, 1000);
        }
    }
}

function fireL() {
    fireDevEvent('fist');
    if (running) {
        if (!action) {
            action = true;
            console.log("SMACK");
            kill('fist');
            fist.play();
            document.getElementById('player-layer-0').style.animation = '0.5s fist';
            setTimeout(function () {
                document.getElementById('player-layer-0').style.animation = undefined;
            }, 500);
            action = false;
        }
    }
}

function chainsawGo() {
    fireDevEvent('chainsaw_start');
    holding = true;
    msCounter = 0;
    if (running) {
        if (!action) {
            action = true;
            console.log("WROOM");
            sawStart = new Date();
            kill('chainsaw');
            chainsaw.play();
            document.getElementById('player-layer-0').style.animation = '0.37s chainsaw_start';
            setTimeout(function () {
                if (holding) { document.getElementById('player-layer-0').style.animation = '0.25s chainsaw_loop infinite'; }
            }, 370);
        }
    }
}

function chainsawStop() {
    fireDevEvent('chainsaw_stop');
    holding = false;
    chainsaw.stop();
    sawTime = Math.abs(new Date() - sawStart);
    document.getElementById('player-layer-0').style.animation = undefined;
    action = false;
}

function newGame() {
    shotgun.play();
    score = 0;
    document.getElementById('score').innerHTML = score;
    hideMenu();
    running = true;
    playLevel();
}

class Record {
    constructor(id) {
        this.id = id;
        this.timestamp = undefined;
        this.type = undefined;
    }
    getId() {
        return this.id;
    }
    getTimestamp() {
        return this.timestamp;
    }
    getType() {
        return this.type;
    }
    setTimestamp(timestamp) {
        this.timestamp = timestamp;
    }
    setType(type) {
        this.type = type;
    }
}

function fireDevEvent(type) {
    if (dev) {
        var record = new Record(devEvents.length);
        record.setTimestamp(new Date());
        record.setType(type);
        devEvents.push(record);
    }
}

function saveDevEvents() {
    fireDevEvent('stop');
    if (dev) {
        var tmpDevEvents = [devEvents[0]];
        for (var i = 1; i < devEvents.length; i++) {
            if (devEvents[i].getType() == 'chainsaw_start') {
                if (devEvents[i].getType() != tmpDevEvents[tmpDevEvents.length - 1].getType()) {
                    tmpDevEvents.push(devEvents[i]);
                }
            } else {
                tmpDevEvents.push(devEvents[i]);
            }
        }
        devEvents = tmpDevEvents;

        console.log('var timing = [');
        for (var i = 0; i < devEvents.length - 1; i++) {
            if (devEvents[i].getType() == 'chainsaw_start') {
                console.log('{')
                console.log("id: 'mancubus',");
                console.log('duration: ' + (Math.abs(devEvents[i].getTimestamp() - devEvents[i + 1].getTimestamp())) + ',');
                console.log('alive: true,');
                console.log('},')
            } else if (devEvents[i].getType() == 'chainsaw_stop') {
                console.log('{')
                console.log("id: 'blank',");
                console.log('duration: ' + (Math.abs(devEvents[i].getTimestamp() - devEvents[i + 1].getTimestamp())) + ',');
                console.log('alive: false,');
                console.log('},')
            } else {
                console.log('{')
                if (devEvents[i].getType() == 'shotgun') {
                    console.log("id: 'imp',");
                    console.log("duration: 1000,");
                    console.log('alive: true,');
                    console.log('},')
                    console.log('{')
                    console.log("id: 'blank',");
                    console.log('duration: ' + (Math.abs(devEvents[i].getTimestamp() - devEvents[i + 1].getTimestamp()) - 1000) + ',');
                } else if (devEvents[i].getType() == 'fist') {
                    console.log("id: 'zombie',");
                    console.log("duration: 750,");
                    console.log('alive: true,');
                    console.log('},')
                    console.log('{')
                    console.log("id: 'blank',");
                    console.log('duration: ' + (Math.abs(devEvents[i].getTimestamp() - devEvents[i + 1].getTimestamp()) - 750) + ',');
                } else {
                    console.log("id: 'blank',");
                    console.log('duration: ' + (Math.abs(devEvents[i].getTimestamp() - devEvents[i + 1].getTimestamp())) + ',');
                }
                console.log('alive: false,');
                console.log('},')
            }
        }
        console.log(']');
    }
}

function devMode() {
    devEvents = [];
    hideMenu();
    running = true;
    dev = true;
    level.play();
    fireDevEvent('start');
}

function giveUp() {
    shotgun.play();
    level.stop();
    showMenu();
    running = false;
}

function exit() {
    navigator.app.exitApp();
}

function hideMenu() {
    document.getElementById('menu-layer').style.visibility = 'hidden';
    document.getElementById('menu-text').style.visibility = 'hidden';
    document.getElementById('give-up').style.visibility = 'visible';
    document.getElementById('score').style.visibility = 'visible';
    if (device.platform != 'browser') {
        document.getElementById('exit').style.visibility = 'hidden';
    }
}

function showMenu() {
    document.getElementById('menu-layer').style.visibility = 'visible';
    document.getElementById('menu-text').style.visibility = 'visible';
    document.getElementById('score').style.visibility = 'hidden';
    document.getElementById('give-up').style.visibility = 'hidden';
    if (device.platform != 'browser') {
        document.getElementById('exit').style.visibility = 'visible';
    }
}

async function playMovement(index, layer) {
    var layno = layer ? "2" : "3";
    if (level.timing[index + 1] != undefined && level.timing[index + 2] != undefined) {
        if (index != 0) { 
            var duration = Number(level.timing[index].duration) + Number(level.timing[index + 1].duration);
            var side = Math.random() < 0.5 ? "left" : "right";
            if (level.timing[index + 2].id == 'imp') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's imp_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s imp_move infinite';
            } else if (level.timing[index + 2].id == 'zombie') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's zombie_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s zombie_move infinite';
            } else if (level.timing[index + 2].id == 'mancubus') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's mancubus_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s mancubus_move infinite';
            } else {
                document.getElementById('enemy-layer-' + layno).style.animation = undefined;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = undefined;
            }
            setTimeout(function() {
                document.getElementById('enemy-layer-' + layno).style.animation = undefined;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = undefined;
            }, duration);
        } else {
            var duration = Number(level.timing[index].duration);
            var side = Math.random() < 0.5 ? "left" : "right";
            if (level.timing[index + 1].id == 'imp') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's imp_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s imp_move infinite';
            } else if (level.timing[index + 1].id == 'zombie') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's zombie_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s zombie_move infinite';
            } else if (level.timing[index + 1].id == 'mancubus') {
                document.getElementById('enemy-layer-' + layno).style.animation = Number(duration / 1000) + 's mancubus_to_center_' + side;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = '0.25s mancubus_move infinite';
            } else {
                document.getElementById('enemy-layer-' + layno).style.animation = undefined;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = undefined;
            }
            setTimeout(function() {
                document.getElementById('enemy-layer-' + layno).style.animation = undefined;
                document.getElementById('enemy-layer-' + layno + '-repeat').style.animation = undefined;
            }, duration);
        }       
    }
}

function playTiming(index, layer) {
    if (running) {
        if (index < level.timing.length) { 
            playMovement(index, layer);
            var newIndex = index + 1;
            console.log(level.timing[index].id + ' start'); 
            if (level.timing[index].id == 'imp') {
                document.getElementById('enemy-layer-1').style.animation = '0.25s imp_idle infinite';
            } else if (level.timing[index].id == 'zombie') {
                document.getElementById('enemy-layer-1').style.animation = '0.25s zombie_idle infinite';
            } else if (level.timing[index].id == 'mancubus') {
                document.getElementById('enemy-layer-1').style.animation = '0.25s mancubus_idle infinite';
            } else {
                document.getElementById('enemy-layer-1').style.animation = undefined;
            }
            currentEnemy = level.timing[index];
            setTimeout(function () {
                chainsawStop();
                checkIfAlive();
                console.log(level.timing[index].id + ' stop'); 
                playTiming(newIndex, !layer);
            }, level.timing[index].duration);
        } else {
            level.stop();
        }
    }
}

function playLevel() {
    level.play();
    playTiming(0, true);
}

function checkIfAlive() {
    if (currentEnemy.alive) {
        fail('dead');
    } else {
        scoreUp();
    }
}

function kill(weapon) {
    if (currentEnemy != undefined) {
        if (currentEnemy.id == 'imp') {
            if (weapon == 'shotgun') {
                hit();
            } else if (weapon == 'chainsaw') {
                fail('ammo');
            } else if (weapon == 'fist') {
                fail('strength');
            }
        } else if (currentEnemy.id == 'zombie') {
            if (weapon == 'shotgun') {
                fail('ammo');
            } else if (weapon == 'chainsaw') {
                fail('ammo');
            } else if (weapon == 'fist') {
                hit();
            }
        } else if (currentEnemy.id == 'mancubus') {
            if (weapon == 'shotgun') {
                fail('strength');
            } else if (weapon == 'chainsaw') {
                hit();
            } else if (weapon == 'fist') {
                fail('strength');
            }
        } else {
            fail('ammo');
        }
    }
}

function scoreUp() {
    if (currentEnemy.id == 'imp') {
        score += 100;
    } else if (currentEnemy.id == 'zombie') {
        score += 50;
    } else if (currentEnemy.id == 'mancubus') {
        if (sawTime != undefined) {
            score += Math.floor(sawTime / 10);
        }
    }
    document.getElementById('score').innerHTML = score;
}

function hit() {
    currentEnemy.alive = false;
    console.log(currentEnemy.id + ' hit');
    if (currentEnemy.id == 'imp') {
        imp.play();
        document.getElementById('enemy-layer-1').style.animation = undefined;
        document.getElementById('enemy-layer-0').style.animation = '0.5s imp_death';
        setTimeout(function() {            
            document.getElementById('enemy-layer-0').style.animation = undefined;
        }, 500);
    } else if (currentEnemy.id == 'zombie') {
        imp.play();
        document.getElementById('enemy-layer-1').style.animation = undefined;
        document.getElementById('enemy-layer-0').style.animation = '0.5s zombie_death';
        setTimeout(function() {            
            document.getElementById('enemy-layer-0').style.animation = undefined;
        }, 500);
    } else if (currentEnemy.id == 'mancubus') {
        imp.play();
        document.getElementById('enemy-layer-1').style.animation = undefined;
        document.getElementById('enemy-layer-0').style.animation = '0.5s mancubus_death';
        setTimeout(function() {            
            document.getElementById('enemy-layer-0').style.animation = undefined;
        }, 500);
    } else {
        document.getElementById('enemy-layer-1').style.animation = undefined;
        document.getElementById('enemy-layer-0').style.animation = undefined;
    }
}

function fail(type) {
    if (type == 'ammo') {
        giveUp(); //TODO fail wasted ammo
        console.log('wasted ammo');
    } else if (type == 'strength') {
        giveUp(); //TODO fail wasted ammo
        console.log('not strong enough');
    } else if (type == 'dead') {
        giveUp(); //TODO fail missed enemy
        console.log('you died');
    }
}

function loadMedia(path) {
    if (device.platform == 'browser') {
        return new Media('/../' + path);
    } else if (device.platform == 'Android') {
        return new Media('/android_asset/www/' + path);
    } else if (device.platform == 'ios') {

    }
}

document.addEventListener('deviceready', function () {
    if (device.platform == 'browser') {
        document.getElementById('exit').style.visibility = 'hidden';
    }
    showMenu();
    shotgun = loadMedia('audio/dsshotgn.wav');
    chainsaw = loadMedia('audio/dssawhit.wav');
    fist = loadMedia('audio/dspunch.wav');
    imp = loadMedia('audio/enemy/dspopain.wav');

    level = loadMedia('audio/levels/' + m1s1);
    level.setVolume('0.2');
    level.timing = m1t1;
}, false);

document.addEventListener("backbutton", function () {
    giveUp();
});