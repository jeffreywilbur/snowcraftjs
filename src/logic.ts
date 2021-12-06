'use strict';

import { GameSettings, Sprite, Sprites, Sounds, ActiveGame, Coords, ActiveAudio } from './models';

const spriteTypes = {
    Player: 0,
    Enemy: 1,
    Snowball: 2,
    Shadow: 3,
    Background: 4
};

let lastRenderedTime: number;
let fps: number;

/* Fix the framerate for different refresh rate screens */
const gameFps = 60;
const frameMinTime = (1000/60) * (60 / gameFps) - (1000/60) * 0.5;
let lastFrameTime = 0;

let frameCount: number = 0;
let frameReference: number;

let paused: boolean = false;

let musicPlaying: boolean = false;

let animFrame = window.requestAnimationFrame;

let renderProcess: number;

let levelLoading = false;

let scaleFactor: number = 1;

let activeStrength: number = 1;

let cancelFrame = window.cancelAnimationFrame;

let activeAudio: Array<ActiveAudio> = [];

let gameCanvas: HTMLCanvasElement;
let gameContext: CanvasRenderingContext2D;
let gameRelPosition = {x: 0, y: 0};
let mouseDown: boolean = false;
let mouseOver: boolean = false;
let gameMouseX: number;
let gameMouseY: number;

let spriteMap: any = {
    shadow: {
        x: 2,
        y: 2,
        width: 38,
        height: 30
    },
    snowball: {
        snowball: {
            x: 0,
            y: 0,
            width: 10,
            height: 10
        },
        splash: {
            x: 0,
            y: 0,
            width: 18,
            height: 14
        },
        sink: {
            x: 0,
            y: 0,
            width: 16,
            height: 7
        },
        puddle: {
            x: 0,
            y: 0,
            width: 20,
            height: 14
        }
    },
    player: {
        walking: {
            x: 15,
            y: 19,
            width: 24,
            height: 34
        },
        walkingAlt: {
            x: 59,
            y: 18,
            width: 30,
            height: 35
        },
        standing: {
            x: 148,
            y: 19,
            width: 26,
            height: 34
        },
        cocked: {
            x: 84,
            y: 99,
            width: 31,
            height: 35
        },
        throwing: {
            x: 150,
            y: 98,
            width: 23,
            height: 36
        },
        hit: {
            x: 199,
            y: 24,
            width: 35,
            height: 30
        },
        hit1: {
            x: 258,
            y: 11,
            width: 32,
            height: 43
        },
        hit2: {
            x: 312,
            y: 10,
            width: 36,
            height: 44
        },
        hit3: {
            x: 368,
            y: 13,
            width: 35,
            height: 40
        },
        normalDeath: {
            x: 208,
            y: 109,
            width: 71,
            height: 32
        },
        hardDeath: {
            x: 290,
            y: 101,
            width: 68,
            height: 48
        },
        wipedOut: {
            x: 376,
            y: 98,
            width: 51,
            height: 53

        }
    },
    enemy: {
        gathering: {
            x: 292,
            y: 23,
            width: 24,
            height: 31
        },
        cocked: {
            x: 332,
            y: 19,
            width: 34,
            height: 35
        },
        throwing: {
            x: 393,
            y: 20,
            width: 24,
            height: 34
        },
        walking: {
            x: 133,
            y: 18,
            width: 30,
            height: 36
        },
        walkingAlt: {
            x: 186,
            y: 18,
            width: 27,
            height: 34
        },
        hit: {
            x: 26,
            y: 75,
            width: 25,
            height: 35
        },
        guard: {
            x: 74,
            y: 75,
            width: 29,
            height: 35
        },
        brushOff: {
            x: 124,
            y: 75,
            width: 29,
            height: 35
        },
        stunned: {
            x: 170,
            y: 76,
            width: 35,
            height: 34
        },
        normalDeath: {
            x: 44,
            y: 145,
            width: 66,
            height: 42
        },
        hardDeath: {
            x: 137,
            y: 142,
            width: 54,
            height: 46
        },
        wipedOut: {
            x: 220,
            y: 145,
            width: 69,
            height: 42
        },
        minorDeath: {
            x: 317,
            y: 145,
            width: 49,
            height: 38
        },
        victory1: {
            x: 244,
            y: 78,
            width: 42,
            height: 35
        },
        victory2: {
            x: 312,
            y: 77,
            width: 40,
            height: 37
        },
        victory3: {
            x: 380,
            y: 76,
            width: 42,
            height: 37
        }
    }
};

let startText = {
    easyColor: 'rgba(55,139,41,1)',
    medColor: 'rgba(55,139,41,1)',
    hardColar: 'rgba(55,139,41,1)',
}

let endText = {
    iterations: 0,
    playColor: 'rgba(55,139,41,1)'
}

let spritePaths = {
    player: 'images/player.png',
    shadow: 'images/shadow.png',
    enemy: 'images/enemy.png',
    playField: 'images/playField.png',
    snowball: 'images/snowball.png',
    snowballShadow: 'images/snowball_shadow.png',
    splash: 'images/splash.png',
    sink: 'images/sink.png',
    puddle: 'images/puddle.png',
    hand: 'images/smallHand.png'
}

let spriteImages = {
    player: new Image(),
    enemy: new Image(),
    playField: new Image(),
    shadow: new Image(),
    snowball: new Image(),
    snowballShadow: new Image(),
    splash: new Image(),
    sink: new Image(),
    puddle: new Image(),
    hand: new Image()
}

let gameSprites: Partial<Sprites> = {
    shadow: {
        active: null,
        status: null,
        x: 0,
        y: 0,
        initialX: 0,
        initialY: 0,
        width: 0,
        height: 0,
        finalX: null,
        finalY: null,
        value: null,
        xDirection: null,
        yDirection: null,
        type: spriteTypes.Shadow
    },
    playField: {
     status: null,
     active: true,
     x: 0,
     y: 0,
     initialX: 0,
     initialY: 0,
     width: 0,
     height: 0,
     finalX: null,
     finalY: null,
     value: null,
     xDirection: null,
     yDirection: null,
     type: spriteTypes.Background
    }
}

let activePlayer: Sprite;

let settings: GameSettings = {
    players: 3,
    enemies: 1,
    maxStrength: 100,
    baselineSnowballDistance: 5,
    enemyHealth: 4,
    playerHealth: 2,
    walkingFps: 5,
    walkingDistance: 3,
    pointsPerHit: 10,
    debugMode: false
}

let activeGame: Partial<ActiveGame> = {
    level: 1,
    enemies: settings.enemies,
    players: settings.players,
    points: 0,
    soundsEnabled: true,
    selectingDifficulty: true
}

let sounds: Sounds = {
    throw: "sounds/throw.mp3",
    hit1: "sounds/hit1.mp3",
    hit2: "sounds/hit2.mp3",
    hit3: "sounds/hit3.mp3",
    deathHit: "sounds/deathHit.mp3",
    intro: "sounds/intro.mp3",
    introAlt: "sounds/introAlt.mp3",
    music: "sounds/music.mp3"
}

document.addEventListener("DOMContentLoaded", function () {
    initialize();
})

const setGamePosition = () => {    
    const relPosition = gameCanvas.getBoundingClientRect();

    gameRelPosition = {
        x: relPosition.left,
        y: relPosition.top
    };
}

const initialize = () => {
    gameCanvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    gameContext = gameCanvas.getContext('2d');

    setGamePosition();

    initializeControls();
    loadAssets();
}

const selectDifficulty = (difficulty: number) => {
    activeGame.selectingDifficulty = false;
    activeGame.gameOver = false;
    activeGame.gameStarted = true;
    activeGame.difficulty = difficulty;    
    activeGame.level = 1;
    activeGame.enemyHealth = difficulty === 1 ? 1 : difficulty === 2 ? 3 : 4;
    activeGame.playerHealth = 4 - difficulty;
    levelLoad();
}

const checkLoaded = () => {
    if (
        activeGame.audioLoaded &&
        activeGame.imagesLoaded
    ) {
        renderProcess = animFrame(render);
    }
}

const loadAssets = () => {
    loadAudio();
    loadImages();
}

const loadAudio = () => {
    const introAudio = new Audio();
    introAudio.src = sounds.intro;
    const throwAudio = new Audio();
    throwAudio.src = sounds.throw;
    const hit1Audio = new Audio();
    hit1Audio.src = sounds.hit1;
    const hit2Audio = new Audio();
    hit2Audio.src = sounds.hit2;
    const hit3Audio = new Audio();
    hit3Audio.src = sounds.hit3;
    const deathHitAudio = new Audio();
    deathHitAudio.src = sounds.deathHit;
    const musicAudio = new Audio();
    musicAudio.src = sounds.music;

    introAudio.oncanplaythrough = () => {
        activeGame.audioLoaded = true;
        checkLoaded();
    };
}

const loadImages = () => {
    spriteImages.player.src = spritePaths.player;
    spriteImages.enemy.src = spritePaths.enemy;
    spriteImages.playField.src = spritePaths.playField;
    spriteImages.shadow.src = spritePaths.shadow;
    spriteImages.snowball.src = spritePaths.snowball;
    spriteImages.splash.src = spritePaths.splash;
    spriteImages.sink.src = spritePaths.sink;
    spriteImages.puddle.src = spritePaths.puddle;
    spriteImages.snowballShadow.src = spritePaths.snowballShadow;
    spriteImages.hand.src = spritePaths.hand;

    spriteImages.playField.onload = () => {
        activeGame.imagesLoaded = true;
        scaleFactor = gameCanvas.width / gameCanvas.clientWidth;
        checkLoaded();
    }
}

const levelLoad = () => {
    if (activeGame.level === 1) {    
        activeGame.loading = true;
        endText.iterations = 0;

        if (!musicPlaying) {
            playSound(sounds.music, true, .5);
            musicPlaying = true;
        }

        activeGame.points = 0;
        activeGame.enemies = activeGame.difficulty === 1 ? 1 : activeGame.difficulty === 2 ? 3 : 5;
    } else {
        activeGame.enemies = activeGame.enemies + activeGame.difficulty;
    }

    mouseDown = false;
    activePlayer = null;
    gameSprites.enemySnowballs = [];
    gameSprites.playerSnowballs = []
    gameSprites.enemies = [];
    gameSprites.players = [];
    gameSprites.deadSprites = [];
    initEnemies();
    initPlayers();
    initialPositioning();
    activeGame.level++;
}

const generateIdentifier = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const isPointInTriangle = (point: Coords, tA: Coords, tB: Coords, tC: Coords): boolean => {
    var A = 1/2 * (-tB.y * tC.x + tA.y * (-tB.x + tC.x) + tA.x * (tB.y - tC.y) + tB.x * tC.y);
    var sign = A < 0 ? -1 : 1;
    var s = (tA.y * tC.x - tA.x * tC.y + (tC.y - tA.y) * point.x + (tA.x - tC.x) * point.y) * sign;
    var t = (tA.x * tB.y - tA.y * tB.x + (tA.y - tB.y) * point.x + (tB.x - tA.x) * point.y) * sign;
    
    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

const genPosition = (tA: Coords, tB: Coords, tC: Coords) : Coords => {
    const coords = {
        x: Math.round((Math.random() * gameCanvas.width)/settings.walkingDistance)*settings.walkingDistance,
        y: Math.round((Math.random() * gameCanvas.height)/settings.walkingDistance)*settings.walkingDistance
    }

    if (
        isPointInTriangle(coords,
            {x: tA.x,y: tA.y},
            {x: tB.x,y: tB.y},
            {x: tC.x,y: tC.y},
        )
    ) {
        return coords;
    } else {
        return genPosition(tA,tB,tC);
    }
}

const validEnemyPosition = (pos: Coords) : boolean => {
    return isPointInTriangle(pos,
        {x: 0,y: 0},
        {x: 0,y: gameCanvas.height - spriteMap.enemy.walking.height},
        {x: gameCanvas.width - spriteMap.enemy.walking.width, y: 0}
    );
}

const genInitialEnemyPosition = () : Coords => {
    return genPosition(
        {x: 0,y: 0},
        {x: 0,y: gameCanvas.height / 2},
        {x: gameCanvas.width * .6, y: 0}
    );
}

const genInitialPlayerPosition = () : Coords => {
    return genPosition(
        {x: gameCanvas.width - spriteMap.player.standing.width,y: gameCanvas.height / 2},
        {x: gameCanvas.width * .4,y: gameCanvas.height - spriteMap.player.standing.height},
        {x: gameCanvas.width - spriteMap.player.standing.width, y: gameCanvas.height - spriteMap.player.standing.height}
    )
}

const initEnemies = () => {
    for (var i = 0; i < activeGame.enemies; i++) {
        const coords = genInitialEnemyPosition();

        const enemy: Sprite = {
            status: 'walking',
            active: true,
            x: coords.x,
            y: coords.y,
            initialX: coords.x,
            initialY: coords.y,
            width: spriteMap.enemy.walking.width,
            height: spriteMap.enemy.walking.height,
            finalX: null,
            finalY: null,
            xDirection: null,
            yDirection: null,
            value: activeGame.enemyHealth,
            type: spriteTypes.Enemy
        };
        
        gameSprites.enemies.push(enemy)
    }
}

const initPlayers = () => {
    for (var i = 0; i < activeGame.players; i++) {
        const coords = genInitialPlayerPosition();

        gameSprites.players.push({
            status: 'standing',
            active: true,
            x: coords.x,
            y: coords.y,
            initialX: null,
            initialY: null,
            width: null,
            height: null,
            finalX: null,
            finalY: null,
            xDirection: null,
            yDirection: null,
            value: activeGame.playerHealth,
            type: spriteTypes.Player
        })
    }
}

const initialPositioning = () => {
    let i = gameSprites.players.length;
    
    while(i--) {
        const p = gameSprites.players[i];
        p.initialY = p.y;
        p.initialX = p.x;
        p.y = p.y + (gameCanvas.height - p.y) + 60;
    }

    i = gameSprites.enemies.length;
    
    while (i--) {
        const e = gameSprites.enemies[i];

        e.finalX = e.x;
        e.finalY = e.y;

        e.x = e.finalX - 102;
        e.y = e.finalY - 102;

        e.xDirection = 1;
        e.yDirection = 1;
    }

    levelLoading = true;
}

const render = (time: number) => {  
    if(time - lastFrameTime < frameMinTime) {
        animFrame(render);
        return;
    }

    if (!paused) {
        frameCount = frameCount === 60 ? 0 : frameCount + 1;
        
        if (frameReference != null) {        
            const delta = (performance.now() - frameReference)/1000;
            fps = 1/delta;
        } else {
            fps = 0;
        }
    
        frameReference = performance.now();
    
        if (levelLoading) {
            movePlayers().then(() => {
                initialEnemyRandomization();
            });
        }
    
        if (activeGame.gameStarted) {
            moveEnemies();
        }
    
        gameContext.clearRect(0,0,gameCanvas.width,gameCanvas.height);
    
        gameContext.drawImage(
            spriteImages.playField,
            0,
            0,
            gameCanvas.width,
            gameCanvas.height);
            
        renderShadows();
        renderDeadSprites();
        renderEnemies();
        renderPlayers();
        renderSnowballs();
        renderText();
        renderDifficulty();
        renderHand();
        renderFPS();
    }

    lastFrameTime = time;

    animFrame(render);
}

const renderFPS = () => {    
    if (settings.debugMode) {
        gameContext.font = "12px Arial";
        gameContext.fillStyle = 'green';
        gameContext.textAlign = 'left';
        gameContext.fillText(fps.toFixed(2) + "fps",5,15);
    }
}

const renderHand = () => {
    if (mouseOver && !activePlayer) {
        gameContext.drawImage(spriteImages.hand,Math.round(gameMouseX),Math.round(gameMouseY),28,30);
    }
}

const renderDifficulty = () => {
    if (activeGame.selectingDifficulty) {
        gameContext.font = "700 28px 'Mountains of Christmas'";
        gameContext.textAlign = 'center';
        gameContext.textBaseline = 'middle';
        gameContext.fillStyle = startText.easyColor;
        gameContext.strokeStyle = 'rgba(255,255,255,.7)';
        gameContext.lineWidth = 15;
        gameContext.strokeText('Easy',gameCanvas.width / 2,(gameCanvas.height / 2) - 45);
        gameContext.fillText('Easy',gameCanvas.width / 2,(gameCanvas.height / 2) - 45);
        gameContext.fillStyle = startText.medColor;
        gameContext.strokeText('Normal',gameCanvas.width / 2,(gameCanvas.height / 2));
        gameContext.fillText('Normal',gameCanvas.width / 2,(gameCanvas.height / 2));
        gameContext.fillStyle = startText.hardColar;
        gameContext.strokeText('Hard',gameCanvas.width / 2,(gameCanvas.height / 2) + 45);
        gameContext.fillText('Hard',gameCanvas.width / 2,(gameCanvas.height / 2) + 45);
    }
}

const renderText = () => {
    gameContext.textBaseline = 'middle';

    if (mouseDown && activePlayer != null) {
        gameContext.font = "8px Arial";
        gameContext.fillStyle = 'red';
        gameContext.fillText(activeStrength + "",activePlayer.x + 25,activePlayer.y + (activePlayer.height * .9));
    }

    if (activeGame.loading) {
        gameContext.font = "100 36px 'Mountains of Christmas'";
        gameContext.strokeStyle = 'rgba(255,255,255,.7)';
        gameContext.lineWidth = 15;
        gameContext.strokeText('Drag the Red Kids to Throw!',gameCanvas.width / 2,gameCanvas.height / 2);
        gameContext.fillStyle = 'rgba(255,0,0,1)';
        gameContext.textAlign = 'center';
        gameContext.fillText('Drag the Red Kids to Throw!',gameCanvas.width / 2,gameCanvas.height / 2);
    }

    gameContext.font = "900 12px Arial";
    gameContext.fillStyle = 'rgba(0,0,255,1)';
    gameContext.textAlign = 'center';
    gameContext.fillText('SCORE: ' + activeGame.points,gameCanvas.width / 2,gameCanvas.height * .97);

    if (activeGame.gameOver && !activeGame.selectingDifficulty) {
        const relFade = endText.iterations / 100;

        gameContext.font = "100 36px 'Mountains of Christmas'";
        gameContext.strokeStyle = 'rgba(255,255,255,.7)';
        gameContext.lineWidth = 15;
        gameContext.strokeText('Happy Holidays',gameCanvas.width / 2,gameCanvas.height / 2);
        gameContext.fillStyle = 'rgba(255,0,0,' + (relFade * .7) + ')';
        gameContext.textAlign = 'center';
        gameContext.fillText('Happy Holidays',gameCanvas.width / 2,gameCanvas.height / 2);
        gameContext.shadowBlur =
            gameContext.shadowColor =
            gameContext.shadowOffsetX =
            gameContext.shadowOffsetY =      
            null;
        endText.iterations++;

        gameContext.font = "700 12px Arial";
        gameContext.fillStyle = endText.playColor;
        gameContext.textAlign = 'right';
        gameContext.fillText("PLAY AGAIN",gameCanvas.width * .98,gameCanvas.height * .97);
    }
}

const renderDeadSprites = () => {
    if (gameSprites.deadSprites != null) {
        let i = gameSprites.deadSprites.length;
        
        while(i--) {
            const s = gameSprites.deadSprites[i];
            renderDeadSprite(s);
        }
    }
}

const renderPlayers = () => {
    if (gameSprites.players != null) {
        const players = gameSprites.players.sort((a, b) => a.y - b.y);

        for (var i = 0, len = players.length; i < len; i++) {
            renderPlayer(players[i]);
        }
    }
}

const renderEnemies = () => {
    if (gameSprites.enemies != null) {
        const enemies = gameSprites.enemies.sort((a, b) => a.y - b.y);

        for (var i = 0, len = enemies.length; i < len; i++) {
            renderEnemy(enemies[i]);
        }
    }
}

const renderShadows = () => {    
    if (gameSprites.players != null) {
        let i = gameSprites.players.length;
        
        while(i--) {
            const p = gameSprites.players[i];
            renderShadow(p);
        }
    
        i = gameSprites.enemies.length;
    
        while(i--) {
            const p = gameSprites.enemies[i];
            renderShadow(p);
        }
    }
}

const renderSnowballs = () => {
    if (
        gameSprites.enemySnowballs != null &&
        gameSprites.playerSnowballs != null
    ) {
        let i = gameSprites.playerSnowballs.length;
        
        while(i--) {
            const b = gameSprites.playerSnowballs[i];
            hitDetection(b,gameSprites.enemies,'enemies');
            renderSnowball(b);
        }
    
        i = gameSprites.enemySnowballs.length;
    
        while(i--) {
            const b = gameSprites.enemySnowballs[i];
            hitDetection(b,gameSprites.players,'players');
            renderSnowball(b);
        }
    }
}

const renderSnowball = (b: Sprite) => {
    
    if (b.status === 'snowball') {
        gameContext.drawImage(
            spriteImages.snowballShadow,
            spriteMap.snowball.snowball.x,
            spriteMap.snowball.snowball.y,
            spriteMap.snowball.snowball.width,
            spriteMap.snowball.snowball.height,
            b.x,
            b.value,
            spriteMap.snowball.snowball.width,
            spriteMap.snowball.snowball.height);
    }

    if (b.status === 'puddle') {
        gameContext.globalAlpha = b.value;
    }

    const y = 
        b.status === 'snowball' ? b.y :
        b.status === 'splash' ? b.y :
        b.status === 'sink' ? b.y + 2 : b.y;

    gameContext.drawImage(
        spriteImages[b.status],
        spriteMap.snowball[b.status].x,
        spriteMap.snowball[b.status].y,
        spriteMap.snowball[b.status].width,
        spriteMap.snowball[b.status].height,
        b.x,
        y,
        spriteMap.snowball[b.status].width,
        spriteMap.snowball[b.status].height);

    gameContext.globalAlpha = 1;
}

const renderShadow = (p: Sprite) => {    
    gameContext.drawImage(
        spriteImages.shadow,
        spriteMap.shadow.x,
        spriteMap.shadow.y,
        spriteMap.shadow.width,
        spriteMap.shadow.height,
        p.x + 2,
        p.y + 10,
        spriteMap.shadow.width,
        spriteMap.shadow.height);
}

const renderDeadSprite = (s: Sprite) => {
    let typeRef: string;
    let x = s.x;
    let y = s.y;
    let image: HTMLImageElement;

    switch(s.type) {
        case spriteTypes.Player:
            typeRef = 'player';
            x = s.status == 'normalDeath' ? s.x - 20 : s.x;
            y = s.status == 'normalDeath' ? s.y + 15 : s.y;
            image = spriteImages.player;
            break;
        case spriteTypes.Enemy:
            typeRef = 'enemy';
            image = spriteImages.enemy;
            break;
        case spriteTypes.Snowball:
            typeRef = 'snowball';
            image = spriteImages[s.status];
            break;
    }
        
    gameContext.drawImage(
        image,
        spriteMap[typeRef][s.status].x,
        spriteMap[typeRef][s.status].y,
        spriteMap[typeRef][s.status].width,
        spriteMap[typeRef][s.status].height,
        x,
        y,
        spriteMap[typeRef][s.status].width,
        spriteMap[typeRef][s.status].height);
}

const renderEnemy = (p: Sprite) => {    
    gameContext.drawImage(
        spriteImages.enemy,
        spriteMap.enemy[p.status].x,
        spriteMap.enemy[p.status].y,
        spriteMap.enemy[p.status].width,
        spriteMap.enemy[p.status].height,
        p.x,
        p.y,
        spriteMap.enemy[p.status].width,
        spriteMap.enemy[p.status].height);

    p.width = spriteMap.enemy[p.status].width;
    p.height = spriteMap.enemy[p.status].height;
}

const renderPlayer = (p: Sprite) => {    
    const x = p.status == 'hit1' ? p.x - 5 :
        p.status == 'hit2' ? p.x - 5 :
        p.status == 'hit3' ? p.x - 5 :
        p.status == 'normalDeath' ? p.x - 20 :
        p.x;
    const y = p.status == 'hit1' ? p.y - 7 :
        p.status == 'hit2' ? p.y - 7 :
        p.status == 'hit3' ? p.y - 7 :
        p.status == 'normalDeath' ? p.y + 15 :
        p.y;
        
    gameContext.drawImage(
        spriteImages.player,
        spriteMap.player[p.status].x,
        spriteMap.player[p.status].y,
        spriteMap.player[p.status].width,
        spriteMap.player[p.status].height,
        x,
        y,
        spriteMap.player[p.status].width,
        spriteMap.player[p.status].height);

    p.width = spriteMap.player[p.status].width;
    p.height = spriteMap.player[p.status].height;
}

const getActivePlayer = (x: number, y: number) : Sprite => {
    if (gameSprites.players != null) {
        let i = gameSprites.players.length;
        
        while (i--) {
            const p = gameSprites.players[i];
    
            if (
                p.active &&
                x >= p.x &&
                x <= p.x + p.width &&
                y >= p.y &&
                y <= p.y + p.height
            ) {
                return p;
            }
        }
    
        return null;
    }
}

const setPlayerStatus = (player: Sprite, x: number, y: number, status: string) => {    
    if (x != null) {
        player.x = Math.round(x - (player.width / 2));
    }

    if (y != null) {
        player.y = Math.round(y - (player.height / 2));
    }

    player.status = status;
}

const removeSnowball = (b: Sprite, snowballs: Array<Sprite>) => {
    let i = snowballs.length;

    while (i--) {
        const snowball = snowballs[i];

        if (snowball.type === spriteTypes.Snowball && snowball.x === b.x && snowball.y === b.y) {
            snowballs.splice(i,1);
            break;
        }
    }
}

const snowballHit = (character: Sprite) => {
    switch (character.value) {
        case 4:
            playSound(sounds.hit1);
            break;
        case 3:
            playSound(sounds.hit2);
            break;
        case 2:
            playSound(sounds.hit3);
            break;
        case 1:
            playSound(sounds.deathHit);
    }
}

const playerHit = (player: Sprite, count: number = 0) : void => {

    if (activePlayer != null && activePlayer.x === player.x && activePlayer.y === player.y) {        
        mouseDown = false;
        activePlayer = null;
    }

    count++;
    
    if (count === 1) {        
        snowballHit(player);

        player.value--;
    }

    player.active = false;

    if (player.value > 0) {
        if (count < 5) {     
            let initialWait = 0;

            if (count === 1) {
                player.status = 'hit';
            } else {
                initialWait = -250;
            }
            
            setTimeout(() => {
                player.status = 'hit1';
            },initialWait + 250);
        
            setTimeout(() => {
                player.status = 'hit2';
            },initialWait + 325);
            
            setTimeout(() => {
                player.status = 'hit3';
            },initialWait + 450);

            setTimeout(() => {
                return playerHit(player,count);
            },initialWait + 575);
        } else {
            player.status = 'standing';
            player.active = true;
        }
    } else {
        killSprite(player,gameSprites.players,'normalDeath');        
        livePlayersCheck(gameSprites.players).then(res => {
            if (res) {
                gameOver();
            }
        });
    }
}

const stopMusic = () => {
    let music: ActiveAudio;

    if (activeAudio != null) {
        let i = activeAudio.length;

        while (i--) {
            const audio = activeAudio[i];

            if (audio.path.indexOf('music') > -1) {
                music = audio;
                break;
            }
        }

        if (music != null) {
            removeAudio(music);
            musicPlaying = false;
        }
    }
}

const gameOver = () => {
    activeGame.gameOver = true;
    stopMusic();
    enemyVictory(0);
}

const enemyHit = (enemy: Sprite) => {
    enemy.active = false;

    snowballHit(enemy);
    
    if (enemy.value > 2) {
        enemy.value--;

        enemy.status = 'hit';
        
        setTimeout(() => {
            enemy.status = 'guard';
        },100);
    
        setTimeout(() => {
            enemy.status = 'brushOff';
        },175);
    
        setTimeout(() => {
            enemy.status = 'walking';
            enemy.active = true;
        },600);
    } else if (enemy.value === 2) {
        enemy.value--;
        enemy.status = 'stunned';
        
        setTimeout(() => {
            enemy.status = 'walking';
            enemy.active = true;
        },1200);
    } else {
        const pointsToAdd = activeGame.difficulty === 1 ? 10 : activeGame.difficulty === 2 ? 50 : 100;

        activeGame.points = activeGame.points + pointsToAdd;
        killSprite(enemy,gameSprites.enemies,'normalDeath');        
        livePlayersCheck(gameSprites.enemies).then(res => {
            if (res) {                
                setTimeout(() => {
                    levelLoad();
                },2000);
            }
        });
    }
}

const killSprite = (s: Sprite, spriteArray: Array<Sprite>, status: string) => {    
    s.active = false;
    s.value--;
    s.status = status;

    let i = spriteArray.length;

    while (i--) {
        const sprite = spriteArray[i];

        if (sprite.x === s.x && sprite.y === s.y && sprite.value === s.value) {
            spriteArray.splice(i,1);
            gameSprites.deadSprites.push(s);
            break;
        }
    }
}

const livePlayersCheck = (spriteArray: Array<Sprite>) : Promise<boolean> => {
    return new Promise((res,rej) => {
        let i = spriteArray.length;
        let dead = 0;
    
        while (i--) {
            const char = spriteArray[i];
    
            if (char.value === 0) {
                dead++;
            }
        }
    
        if (dead === spriteArray.length) {
            res(true);
        } else {
            res(false);
        }
    });
}

const hitDetection = (b: Sprite, team: Array<Sprite>, teamName: string) => {
    let i = team.length;

    while (i--) {
        const player = team[i];
        if (
            player.active &&
            b.active &&
            b.x > player.x - b.width &&
            b.x < player.x + player.width &&
            b.y > player.y - b.height &&
            b.y < player.y + player.height
        ) {
            if (teamName === 'enemies') {
                enemyHit(player);
                removeSnowball(b,gameSprites.playerSnowballs);
            } else {
                playerHit(player);
                removeSnowball(b,gameSprites.enemySnowballs);
            }
            break;
        }
    }
}

const getQBezierValue = (t: number, tB: number, tC: number, p3: number) => {
    var iT = 1 - t;
    return iT * iT * tB + 2 * iT * t * tC + t * t * p3;
}

const getArchPoint = (startX: number,
    startY: number,
    cpX: number,
    cpY: number,
    endX: number,
    endY: number,
    position: number) => {
        return {
            x: getQBezierValue(position, startX, cpX, endX),
            y: getQBezierValue(position, startY, cpY, endY)
        };
}

const moveSnowball = (b: Sprite,
    initialX: number,
    initialY: number,
    speed: number,
    distance: number,
    strength: number,
    position: number,    
    teamName: string,
    endX: number = null,
    endY: number = null) => {

    if (b != null &&
        (b.x < 0 ||
        b.y < 0 ||
        b.x > gameCanvas.width ||
        b.y > gameCanvas.height)
        ) {        
        const snowballs = teamName === 'enemies' ? gameSprites.enemySnowballs : gameSprites.playerSnowballs;
        removeSnowball(b,snowballs);
        return;
    }

    if (b != null && Math.round(position) !== 1) {
        let buffer = 0.006;
        let startX,
            startY,
            endX: number,
            endY: number,
            cpX,
            cpY;

        if (teamName === 'enemies') {            
            startX = initialX,
                startY = initialY,
                endX = initialX + distance,
                endY = initialY + distance + 30,
                cpX = initialX + (distance * .6),
                cpY = initialY + (distance * .6) - strength;

        } else {
            startX = initialX,
            startY = initialY,
            endX = initialX - distance,
            endY = initialY - distance + 30,
            cpX = initialX - (distance * .6),
            cpY = initialY - (distance * .6) - strength;
        }

        let point = getArchPoint(startX,startY,cpX,cpY,endX,endY,position);
        position = (position + buffer) % 1.0;

        b.x = Math.round(point.x);
        b.y = Math.round(point.y);

        b.value = (((b.x - startX) / (endX - startX) * (endY - startY)) + startY);
        
        setTimeout(() => {
            moveSnowball(b,initialX,initialY,speed,distance,strength, position, teamName, endX, endY);
        }, 1);
    } else {
        const snowballs = teamName === 'enemies' ? gameSprites.enemySnowballs : gameSprites.playerSnowballs;
        killSprite(b,snowballs,'splash');

        setTimeout(() => {
            b.status = 'sink';
        },75);
        
        setTimeout(() => {
            b.status = 'puddle';

            let count = 0;

            const interval = setInterval(() => {
                count++;
                b.value = (500 - (50 * count)) / 500;

                if (count === 10) {
                    clearInterval(interval);
                    removeSnowball(b,gameSprites.deadSprites);
                }
            },50);
        },150);
    }
}

const playSound = (soundPath: string, loopWhilePlaying: boolean = false, volume: number = 1) => {
    if (!paused && activeGame.soundsEnabled) {
        const audio = new Audio(soundPath);
        const id = generateIdentifier();
        const audioRef = {
            id: id,
            audio: audio,
            path: soundPath
        };

        activeAudio.push(audioRef);

        audio.volume = volume;
        audio.play();
    
        audio.onended = () => {
            if (!loopWhilePlaying) {
                removeAudio(audioRef);
            } else {
                if (!activeGame.gameOver) {
                    audio.play();
                } else {
                    removeAudio(audioRef);
                }
            }
        };
    }
}

const resumeAllAudio = () => {
    let i = activeAudio.length;

    while (i--) {
        const a = activeAudio[i];
        a.audio.play();
    }
}

const pauseAllAudio = () => {
    let i = activeAudio.length;

    while (i--) {
        const a = activeAudio[i];
        a.audio.pause();
    }
}

const removeAudio = (ref: ActiveAudio) => {    
    ref.audio.src = '';
    let i = activeAudio.length;

    while (i--) {
        const a = activeAudio[i];

        if (a.id == ref.id) {
            activeAudio.splice(i,1);
            break;
        }
    }
}

const genSnowball = (x: number, y: number, speed: number, teamName: string) => {
    playSound(sounds.throw);

    let snowBall: Sprite = {
        status: 'snowball',
        active: true,
        initialX: x,
        initialY: y,
        x: x,
        y: y,
        width: spriteMap.snowball.snowball.width,
        height: spriteMap.snowball.snowball.height,
        finalX: null,
        finalY: null,
        value: null,
        xDirection: null,
        yDirection: null,
        type: spriteTypes.Snowball
    }

    if (teamName === 'players') {
        gameSprites.playerSnowballs.push(snowBall);
    } else {
        gameSprites.enemySnowballs.push(snowBall);
    }

    let distance = settings.baselineSnowballDistance * speed;

    snowBall.value = snowBall.y;

    moveSnowball(snowBall,snowBall.x,snowBall.y,2,distance,activeStrength,0.0,teamName);
}

const calcEnemyPosition = (e: Sprite) : void => {
    let finalX = Math.round((Math.random() * 200)/settings.walkingDistance)*settings.walkingDistance;
    let finalY = finalX;

    let direction = Math.round(Math.random());

    if (direction === 0) {
        finalX = -finalX;
    }

    e.xDirection = direction;

    direction = Math.round(Math.random());
    
    if (direction === 0) {
        finalY = -finalY;
    }

    e.yDirection = direction;

    e.finalX = e.x + finalX;
    e.finalY = e.y + finalY;
    
    if (!validEnemyPosition({x: e.finalX,y: e.finalY})) {
        return calcEnemyPosition(e);
    }
}

const movePlayers = () : Promise<boolean> => {
    return new Promise((res,rej) => {
        if (frameCount % settings.walkingFps === 0) {
            let moving: boolean = false;
        
            let i = gameSprites.players.length;
        
            while(i--) {
                const p = gameSprites.players[i];
        
                if (p.x > p.initialX || p.y > p.initialY) {    
                    p.active = false;

                    p.x = p.x - settings.walkingDistance;
                    p.y = p.y - settings.walkingDistance;
        
                    moving = true;

                    p.status = p.status === 'walking' ? 'walkingAlt' : 'walking';
                } else {
                    p.active = true;
                    p.status = 'standing';
                }
            }
        
            if (!moving) {
                res(true);
            }
        }
    });
}

const initialEnemyRandomization = () => {
    let i = gameSprites.enemies.length;
    
    while (i--) {
        const e = gameSprites.enemies[i];
        calcEnemyPosition(e);
    }

    levelLoading = false;
    activeGame.loading = false;
}

const moveEnemies = () => {
    if (frameCount % settings.walkingFps === 0) {
        let i = gameSprites.enemies.length;
        
        while (i--) {
            const e = gameSprites.enemies[i];
            let moving = false;
    
            if (e.active) {
                if (Math.round(e.x) !== e.finalX) {
                    moving = true;

                    const xDistance = e.xDirection === 0 ? -settings.walkingDistance : settings.walkingDistance;
                    e.x = e.x + xDistance;
                }

                if (Math.round(e.y) !== e.finalY) {
                    moving = true;

                    const yDistance = e.yDirection === 0 ? -settings.walkingDistance : settings.walkingDistance;
                    e.y = e.y + yDistance;
                }
                
                if (moving) {
                    e.status = e.status == 'walking' ? 'walkingAlt' : 'walking';
                } else {
                    enemyThrowSnowball(e);
                }
            }
        }
    }
}

const enemyThrowSnowball = (e: Sprite) => {    
    if (levelLoading) {
        e.status = 'walking';
        e.active = true;
    } else {
        e.status = 'gathering';
        e.active = false;
    
        setTimeout(() => {
            e.status = 'cocked';
        },150);
    
        setTimeout(() => {
            e.status = 'throwing';
    
            const strength = Math.round(Math.random() * ((settings.maxStrength * .8) - 30) + 30);
            genSnowball(e.x + 5,e.y,strength, 'enemies');
            
            setTimeout(() => {
                e.status = 'walking';
                e.active = true;
                calcEnemyPosition(e);
            },500);
        },375);
    }
}

const enemyVictory = (iterations: number) => {
    if (activeGame.gameOver) {
        const status = iterations === 0 ? 'victory1' : iterations === 1 ? 'victory2' : 'victory3';
        let i = gameSprites.enemies.length;
        
        while (i--) {
            const enemy = gameSprites.enemies[i];
            enemy.active = false;
    
            enemy.status = status;
        }     
        
        if (iterations === 2) {
            iterations = 0;
        } else {
            iterations++;
        }

        const waitTime = Math.round(Math.random() * (300 - 100) + 100);
    
        setTimeout(() => {
            enemyVictory(iterations);
        },waitTime);
    }
}

const increaseActiveStrength = () => {
    if (mouseDown) {
        setTimeout(() => {
            if (activeStrength < settings.maxStrength) {
                activeStrength++;
            }
            increaseActiveStrength();
        },30);
    }
}

const mouseIsOver = (mouseX: number,
    mouseY: number,
    pos: Coords,
    width: number,
    height: number) : boolean => {

    if (
        mouseX > pos.x &&
        mouseX < pos.x + width &&
        mouseY > pos.y &&
        mouseY < pos.y + height
    ) {
        return true;
    }

    return false;
}

const hoverEasy = (mouseX: number, mouseY: number) => {
    const playPos = {
        x: (gameCanvas.width / 2) - 50,
        y: (gameCanvas.height / 2) - 60
    };
    
    if (
        !activeGame.gameStarted &&
        mouseIsOver(
            mouseX,
            mouseY,
            playPos,
            100,
            40
        )
    ) {
        return true;
    }

    return false;
}

const hoverMed = (mouseX: number, mouseY: number) => {
    const playPos = {
        x: (gameCanvas.width / 2) - 50,
        y: (gameCanvas.height / 2) - 10
    };
    
    if (
        !activeGame.gameStarted &&
        mouseIsOver(
            mouseX,
            mouseY,
            playPos,
            100,
            30
        )
    ) {
        return true;
    }

    return false;
}

const hoverHard = (mouseX: number, mouseY: number) => {
    const playPos = {
        x: (gameCanvas.width / 2) - 50,
        y: (gameCanvas.height / 2) + 30
    };
    
    if (
        !activeGame.gameStarted &&
        mouseIsOver(
            mouseX,
            mouseY,
            playPos,
            100,
            30
        )
    ) {
        return true;
    }

    return false;
}

const hoverPlay = (mouseX: number, mouseY: number) => {
    const playPos = {
        x: gameCanvas.width * .87,
        y: gameCanvas.height * .9
    };

    if (
        activeGame.gameOver &&
        mouseIsOver(
            mouseX,
            mouseY,
            playPos,
            gameCanvas.width * .2,
            gameCanvas.height * .2
        )
    ) {
        return true;
    }

    return false;
}

const playAgain = () => {
    activeGame.selectingDifficulty = true;
    activeGame.gameStarted = false;
}

const initializeControls = () => {    
    gameCanvas.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        setGamePosition();
        mouseDown = true;

        gameMouseX = (e.clientX - gameRelPosition.x) * scaleFactor;
        gameMouseY = (e.clientY - gameRelPosition.y) * scaleFactor;

        if (activeGame.gameOver) {
            if (hoverPlay(gameMouseX,gameMouseY)) {
                playAgain();
            }
        }
        
        if (!activeGame.gameStarted) {
            if (hoverEasy(gameMouseX,gameMouseY)) {
                selectDifficulty(1);
            }
    
            if (hoverMed(gameMouseX,gameMouseY)) {
                selectDifficulty(2);
            }
    
            if (hoverHard(gameMouseX,gameMouseY)) {
                selectDifficulty(3);
            }
        }

        if (!levelLoading) {
            increaseActiveStrength();
            activePlayer = getActivePlayer(gameMouseX,gameMouseY);
    
            if (activePlayer != null) {
                activePlayer.status = 'cocked';
            }
        }
    });
    window.addEventListener('mouseup', (e: MouseEvent) => {
        e.preventDefault();
        setGamePosition();
        mouseDown = false;

        if (activePlayer != null) {
            setPlayerStatus(activePlayer,null,null,'standing');
            genSnowball(activePlayer.x + 5,activePlayer.y,activeStrength, 'players');
            activePlayer = null;
        }

        activeStrength = 1;
    });
    gameCanvas.addEventListener('mousemove', (e: MouseEvent) => {
        e.preventDefault();
        setGamePosition();

        mouseOver = true;
        gameMouseX = (e.clientX - gameRelPosition.x) * scaleFactor;
        gameMouseY = (e.clientY - gameRelPosition.y) * scaleFactor;

        if (activeGame.gameOver) {
            if (hoverPlay(gameMouseX,gameMouseY)) {
                endText.playColor = 'rgba(116,214,128,1)';
            } else {
                endText.playColor = 'rgba(55,139,41,1)';
            }
        }

        if (!activeGame.gameStarted) {
            if (hoverEasy(gameMouseX,gameMouseY)) {
                startText.easyColor = 'rgba(116,214,128,1)';
            } else {
                startText.easyColor = 'rgba(55,139,41,1)';
            }
            if (hoverMed(gameMouseX,gameMouseY)) {
                startText.medColor = 'rgba(116,214,128,1)';
            } else {
                startText.medColor = 'rgba(55,139,41,1)';
            }
            if (hoverHard(gameMouseX,gameMouseY)) {
                startText.hardColar = 'rgba(116,214,128,1)';
            } else {
                startText.hardColar = 'rgba(55,139,41,1)';
            }
        }

        if (mouseDown) {
            if (activePlayer != null) {
                setPlayerStatus(activePlayer,gameMouseX,gameMouseY,'cocked');
            }
        }
    });
    window.addEventListener('blur', () => {
        paused = true;
        pauseAllAudio();
    });
    window.addEventListener('focus', () => {
        paused = false;
        resumeAllAudio();
    });
}