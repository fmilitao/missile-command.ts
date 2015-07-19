
enum Command {
    ROTATE_LEFT,
    ROTATE_RIGHT,
    ENGINE_ON,
    ENGINE_OFF,
    FIRE_MISSILE
};

module Random {

    //FIXME typescript improvement suggestion?
    const Commands = [Command.ROTATE_LEFT, Command.ROTATE_RIGHT,
        Command.ENGINE_ON, Command.ENGINE_OFF, Command.FIRE_MISSILE];

    export function nextCommand(): Command {
        return Commands[Math.floor(Math.random() * Commands.length)];
    };

    export function nextBoolean(): boolean {
        return Math.random() > 0.5;
    }

};

class Color {

    constructor(
        public r: number,
        public g: number,
        public b: number
        ) {
        // empty
    }

    darker() {
        return new Color(
            Math.floor(this.r * Constants.FACTOR),
            Math.floor(this.g * Constants.FACTOR),
            Math.floor(this.b * Constants.FACTOR)
            );
    }

    toString() {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
    }

    alpha(alpha: number): string {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (alpha / 255) + ')';
    }

}

module Constants {

    export const FACTOR = 0.7;

    export const GRAY = new Color(128, 128, 128);
    export const YELLOW = new Color(255, 255, 0);
    export const CYAN = new Color(0, 255, 255);
    export const PINK = new Color(250, 175, 175);
    export const RED = new Color(255, 0, 0);
    export const BLUE = new Color(0, 0, 255);

    export const UNIVERSE_WIDTH = 1100;
    export const UNIVERSE_HEIGHT = 500;

    export const TIME_DELTA = 1.0; // in s (simulation time)
    export const FRAME_DELAY = 50; // in ms (real time)

    // movement directions
    export const MAX_DIRECTIONS = 16;
    export const DIRECTION_DELTA = 2 * Math.PI / MAX_DIRECTIONS;

    // missile movement constants
    export const MISSILE_ACCELERATION = 0.1;
    export const MISSILE_INITIAL_VELOCITY = 5;
    export const MISSILE_TRACE_LENGTH = 30;

    export const EXPLOSION_TIME = 10;
    export const EXPLOSION_OVALS = 4;

    export const LAUNCHER_COOL_OFF_TIME = 40;

    // object dimensions (all should be divisible by 2)
    export const CAPITALSHIP_SIZE = 80;
    export const MISSILE_SIZE = 8;
    export const LAUNCHER_SIZE = MISSILE_SIZE * 2;
    export const EXPLOSION_SIZE = MISSILE_SIZE;

    export const CAPITALSHIP_RADIUS = CAPITALSHIP_SIZE / 2;
    export const MISSILE_RADIUS = MISSILE_SIZE / 2;
    export const LAUNCHER_RADIUS = LAUNCHER_SIZE / 2;

};

class RadarEvent {

    private object: Actors.Actor;

    private x: number;
    private y: number;
    private vx: number;
    private vy: number;
    private angle: number;

    constructor(a: Actors.Actor) {
        if (a === null)
            throw ("null argument");

        // Note that the actor continues its life after this.
        // Thus, all positions must be copied as they changed in 'a'
        this.object = a;
        this.x = a.getX();
        this.y = a.getY();
        this.vx = a.getVx();
        this.vy = a.getVy();
        this.angle = a.getAngle();
    }

    getActor() {
        return this.object;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getVx() {
        return this.vx;
    }

    getVy() {
        return this.vy;
    }

    getAngle() {
        return this.angle; // in radians
    }

    getActorID() {
        return this.object.getID();
    }

    isMissile() {
        return this.object instanceof Actors.Missile;
    }

    isLauncher() {
        return this.object instanceof Actors.Launcher;
    }

    isCapitalship() {
        return this.object instanceof Actors.Capitalship;
    }

    isOnSameTeam(c: Commander) {
        return this.object.getCommander() === c;
    }

};

class RadioCommand {

    public target: Actors.Actor;
    public action: Command;

    constructor(destination: RadarEvent, action: Command) {
        if (destination === null || action === null)
            throw ("null argument(s)");

        this.target = destination.getActor();
        this.action = action;
    }

};
