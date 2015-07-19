var Command;
(function (Command) {
    Command[Command["ROTATE_LEFT"] = 0] = "ROTATE_LEFT";
    Command[Command["ROTATE_RIGHT"] = 1] = "ROTATE_RIGHT";
    Command[Command["ENGINE_ON"] = 2] = "ENGINE_ON";
    Command[Command["ENGINE_OFF"] = 3] = "ENGINE_OFF";
    Command[Command["FIRE_MISSILE"] = 4] = "FIRE_MISSILE";
})(Command || (Command = {}));
;
var Random;
(function (Random) {
    var Commands = [Command.ROTATE_LEFT, Command.ROTATE_RIGHT,
        Command.ENGINE_ON, Command.ENGINE_OFF, Command.FIRE_MISSILE];
    function nextCommand() {
        return Commands[Math.floor(Math.random() * Commands.length)];
    }
    Random.nextCommand = nextCommand;
    ;
    function nextBoolean() {
        return Math.random() > 0.5;
    }
    Random.nextBoolean = nextBoolean;
})(Random || (Random = {}));
;
var Color = (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.prototype.darker = function () {
        return new Color(Math.floor(this.r * Constants.FACTOR), Math.floor(this.g * Constants.FACTOR), Math.floor(this.b * Constants.FACTOR));
    };
    Color.prototype.toString = function () {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
    };
    Color.prototype.alpha = function (alpha) {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (alpha / 255) + ')';
    };
    return Color;
})();
var Constants;
(function (Constants) {
    Constants.FACTOR = 0.7;
    Constants.GRAY = new Color(128, 128, 128);
    Constants.YELLOW = new Color(255, 255, 0);
    Constants.CYAN = new Color(0, 255, 255);
    Constants.PINK = new Color(250, 175, 175);
    Constants.RED = new Color(255, 0, 0);
    Constants.BLUE = new Color(0, 0, 255);
    Constants.UNIVERSE_WIDTH = 1100;
    Constants.UNIVERSE_HEIGHT = 500;
    Constants.TIME_DELTA = 1.0;
    Constants.FRAME_DELAY = 50;
    Constants.MAX_DIRECTIONS = 16;
    Constants.DIRECTION_DELTA = 2 * Math.PI / Constants.MAX_DIRECTIONS;
    Constants.MISSILE_ACCELERATION = 0.1;
    Constants.MISSILE_INITIAL_VELOCITY = 5;
    Constants.MISSILE_TRACE_LENGTH = 30;
    Constants.EXPLOSION_TIME = 10;
    Constants.EXPLOSION_OVALS = 4;
    Constants.LAUNCHER_COOL_OFF_TIME = 40;
    Constants.CAPITALSHIP_SIZE = 80;
    Constants.MISSILE_SIZE = 8;
    Constants.LAUNCHER_SIZE = Constants.MISSILE_SIZE * 2;
    Constants.EXPLOSION_SIZE = Constants.MISSILE_SIZE;
    Constants.CAPITALSHIP_RADIUS = Constants.CAPITALSHIP_SIZE / 2;
    Constants.MISSILE_RADIUS = Constants.MISSILE_SIZE / 2;
    Constants.LAUNCHER_RADIUS = Constants.LAUNCHER_SIZE / 2;
})(Constants || (Constants = {}));
;
var RadarEvent = (function () {
    function RadarEvent(a) {
        if (a === null)
            throw ("null argument");
        this.object = a;
        this.x = a.getX();
        this.y = a.getY();
        this.vx = a.getVx();
        this.vy = a.getVy();
        this.angle = a.getAngle();
    }
    RadarEvent.prototype.getActor = function () {
        return this.object;
    };
    RadarEvent.prototype.getX = function () {
        return this.x;
    };
    RadarEvent.prototype.getY = function () {
        return this.y;
    };
    RadarEvent.prototype.getVx = function () {
        return this.vx;
    };
    RadarEvent.prototype.getVy = function () {
        return this.vy;
    };
    RadarEvent.prototype.getAngle = function () {
        return this.angle;
    };
    RadarEvent.prototype.getActorID = function () {
        return this.object.getID();
    };
    RadarEvent.prototype.isMissile = function () {
        return this.object instanceof Actors.Missile;
    };
    RadarEvent.prototype.isLauncher = function () {
        return this.object instanceof Actors.Launcher;
    };
    RadarEvent.prototype.isCapitalship = function () {
        return this.object instanceof Actors.Capitalship;
    };
    RadarEvent.prototype.isOnSameTeam = function (c) {
        return this.object.getCommander() === c;
    };
    return RadarEvent;
})();
;
var RadioCommand = (function () {
    function RadioCommand(destination, action) {
        if (destination === null || action === null)
            throw ("null argument(s)");
        this.target = destination.getActor();
        this.action = action;
    }
    return RadioCommand;
})();
;
//# sourceMappingURL=game.js.map