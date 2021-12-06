export class GameSettings {
    players: number;
    enemies: number;
    maxStrength: number;
    baselineSnowballDistance: number;
    enemyHealth: number;
    playerHealth: number;
    walkingFps: number;
    walkingDistance: number;
    pointsPerHit: number;
    debugMode: boolean;
}

export class ActiveAudio {
    id: string;
    audio: HTMLAudioElement;
    path: string;
}

export class Coords {
    x: number;
    y: number;
}

export class ActiveGame {
    loading: boolean;
    imagesLoaded: boolean;
    audioLoaded: boolean;
    level: number;
    enemies: number;
    enemyHealth: number;
    players: number;
    playerHealth: number;
    points: number;
    gameOver: boolean;
    gameStarted: boolean;
    selectingDifficulty: boolean;
    soundsEnabled: boolean;
    difficulty: number;
}

export class Sounds {
    throw: string;
    hit1: string;
    hit2: string;
    hit3: string;
    deathHit: string;
    intro: string;
    introAlt: string;
    music: string;
}

export enum SpriteType {
    Player = 0,
    Enemy = 1,
    Snowball = 2,
    Shadow = 3,
    Background = 4
}

export class Sprite {
    status: string;
    active: boolean;
    initialX: number;
    initialY: number;
    x: number;
    y: number;
    finalX: number;
    finalY: number
    width: number;
    height: number;
    value: number;
    xDirection: number;
    yDirection: number;
    type: SpriteType
}

export class Sprites {
    playField: Sprite;
    players: Array<Sprite>;
    enemies: Array<Sprite>;
    shadow: Sprite;
    playerSnowballs: Array<Sprite>;
    enemySnowballs: Array<Sprite>;
    deadSprites: Array<Sprite>;
}