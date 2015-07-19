var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Actors;
(function (Actors) {
    var ID = 0;
    ;
    var Actor = (function () {
        function Actor(commander, x, y, direction) {
            this.commander = commander;
            this.x = x;
            this.y = y;
            if (direction < 0 || direction > Constants.MAX_DIRECTIONS)
                throw ("direction out of bounds");
            if (commander === null)
                throw ("null argument");
            this.actorID = ID++;
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;
            this.dir = direction || 0;
        }
        Actor.prototype.getCommander = function () {
            return this.commander;
        };
        Actor.prototype.getX = function () { return this.x; };
        Actor.prototype.getY = function () { return this.y; };
        Actor.prototype.getVx = function () { return this.vx; };
        Actor.prototype.getVy = function () { return this.vy; };
        Actor.prototype.getAngle = function () {
            return this.dir * Constants.DIRECTION_DELTA;
        };
        Actor.prototype.tick = function (dt) {
            this.x = this.x + this.vx * dt + this.ax / 2 * dt * dt;
            this.y = this.y + this.vy * dt + this.ay / 2 * dt * dt;
            this.vx = this.vx + this.ax * dt;
            this.vy = this.vy + this.ay * dt;
        };
        Actor.prototype.isUseless = function () {
            return false;
        };
        Actor.prototype.receive = function (x) {
            throw "abstract";
        };
        Actor.prototype.accept = function (v) {
            throw "abstract";
        };
        Actor.prototype.getRadius = function () {
            throw "abstract";
        };
        Actor.prototype.onHit = function (other) {
            throw "abstract";
        };
        Actor.prototype.intersects = function (a) {
            if (this === a)
                return false;
            return (Math.pow(a.getX() - this.getX(), 2) +
                Math.pow(a.getY() - this.getY(), 2)) <=
                Math.pow(a.getRadius() + this.getRadius(), 2);
        };
        Actor.prototype.toRadarEvent = function () {
            return new RadarEvent(this);
        };
        Actor.prototype.getID = function () {
            return this.actorID;
        };
        Actor.prototype.isCollidable = function () {
            return !this.isUseless();
        };
        Actor.prototype.isOutOfBounds = function () {
            return (this.getX() - this.getRadius()) < 0 ||
                (this.getY() - this.getRadius()) < 0 ||
                (this.getX() + this.getRadius()) >= Constants.UNIVERSE_WIDTH ||
                (this.getY() + this.getRadius()) >= Constants.UNIVERSE_HEIGHT;
        };
        Actor.prototype.rotateLeft = function () {
            this.dir = (this.dir + 1) % Constants.MAX_DIRECTIONS;
        };
        Actor.prototype.rotateRight = function () {
            this.dir = (this.dir - 1) % Constants.MAX_DIRECTIONS;
        };
        Actor.prototype.setSpeed = function (vel) {
            var a = this.getAngle();
            this.vx = vel * Math.cos(a);
            this.vy = -vel * Math.sin(a);
        };
        Actor.prototype.setAcceleration = function (acc) {
            var a = this.getAngle();
            this.ax = acc * Math.cos(a);
            this.ay = -acc * Math.sin(a);
        };
        return Actor;
    })();
    Actors.Actor = Actor;
    ;
    var Capitalship = (function (_super) {
        __extends(Capitalship, _super);
        function Capitalship(leader, x, y) {
            _super.call(this, leader, x, y);
        }
        Capitalship.prototype.receive = function (x) {
            return null;
        };
        Capitalship.prototype.accept = function (v) {
            if (v === null)
                throw ("null argument");
            v.visitCapitalship(this);
        };
        Capitalship.prototype.onHit = function (other) {
            this.commander.incCapitalshipDamage();
        };
        Capitalship.prototype.getRadius = function () {
            return Constants.CAPITALSHIP_RADIUS;
        };
        return Capitalship;
    })(Actor);
    Actors.Capitalship = Capitalship;
    ;
    var Explosion = (function (_super) {
        __extends(Explosion, _super);
        function Explosion(leader, x, y) {
            _super.call(this, leader, x, y);
            this.timer = Constants.EXPLOSION_TIME;
            if (this.x < 0)
                this.x = 0;
            if (this.x >= Constants.UNIVERSE_WIDTH)
                this.x = Constants.UNIVERSE_WIDTH - 1;
            if (this.y < 0)
                this.y = 0;
            if (this.y >= Constants.UNIVERSE_HEIGHT)
                this.y = Constants.UNIVERSE_HEIGHT - 1;
        }
        Explosion.prototype.tick = function (dt) {
            this.timer -= dt;
        };
        Explosion.prototype.isUseless = function () {
            return this.timer < 0;
        };
        Explosion.prototype.receive = function (x) {
            return null;
        };
        Explosion.prototype.accept = function (v) {
            if (v === null)
                throw ("null argument");
            v.visitExplosion(this);
        };
        Explosion.prototype.getRadius = function () {
            return 0;
        };
        Explosion.prototype.isCollidable = function () {
            return false;
        };
        Explosion.prototype.onHit = function (other) {
        };
        Explosion.prototype.intersects = function (a) {
            return false;
        };
        Explosion.prototype.isOutOfBounds = function () {
            return false;
        };
        return Explosion;
    })(Actor);
    Actors.Explosion = Explosion;
    ;
    var Launcher = (function (_super) {
        __extends(Launcher, _super);
        function Launcher(leader, x, y, dir) {
            _super.call(this, leader, x, y, dir);
            this.heat = 0;
        }
        Launcher.prototype.receive = function (x) {
            if (x === null)
                throw ("null argument");
            switch (x) {
                case Command.FIRE_MISSILE:
                    if (!this.isCooling()) {
                        this.commander.incLaunched();
                        this.heat = Constants.LAUNCHER_COOL_OFF_TIME;
                        var a = this.getAngle();
                        return new MissileContext(this.commander, this.getX() + Math.cos(a) * (Constants.LAUNCHER_RADIUS + Constants.MISSILE_RADIUS + 1), this.getY() - Math.sin(a) * (Constants.LAUNCHER_RADIUS + Constants.MISSILE_RADIUS + 1), this.dir);
                    }
                    break;
            }
            return null;
        };
        Launcher.prototype.isCooling = function () {
            return this.heat > 0;
        };
        Launcher.prototype.accept = function (v) {
            if (v === null)
                throw ("null argument");
            v.visitLauncher(this);
        };
        Launcher.prototype.onHit = function (other) {
            this.commander.incLauncherDamage();
            this.heat = 2 * Constants.LAUNCHER_COOL_OFF_TIME;
        };
        Launcher.prototype.tick = function (dt) {
            _super.prototype.tick.call(this, dt);
            this.heat -= dt;
            if (this.heat < 0)
                this.heat = 0;
        };
        Launcher.prototype.getRadius = function () {
            return Constants.LAUNCHER_RADIUS;
        };
        return Launcher;
    })(Actor);
    Actors.Launcher = Launcher;
    ;
    var Missile = (function (_super) {
        __extends(Missile, _super);
        function Missile(leader, x, y, dir) {
            _super.call(this, leader, x, y, dir);
            this.setSpeed(Constants.MISSILE_INITIAL_VELOCITY);
            this.engine = false;
            this.destroyed = false;
            this.xpoints = new Array(Constants.MISSILE_TRACE_LENGTH);
            this.ypoints = new Array(Constants.MISSILE_TRACE_LENGTH);
            this.p = 0;
            for (var i = 0; i < Constants.MISSILE_TRACE_LENGTH; ++i) {
                this.xpoints[i] = -1;
                this.ypoints[i] = -1;
            }
        }
        Missile.prototype.isUseless = function () {
            return this.destroyed;
        };
        Missile.prototype.accept = function (v) {
            if (v === null)
                throw ("null argument");
            v.visitMissile(this);
        };
        Missile.prototype.tick = function (dt) {
            this.xpoints[this.p] = this.x;
            this.ypoints[this.p] = this.y;
            this.p = (this.p + 1) % Constants.MISSILE_TRACE_LENGTH;
            if (this.engine)
                this.setAcceleration(Constants.MISSILE_ACCELERATION);
            _super.prototype.tick.call(this, dt);
            if ((Math.pow(this.vx, 2) + Math.pow(this.vy, 2)) > Math.pow(Constants.MISSILE_SIZE, 2)) {
                var v_angle = Math.atan2(this.vy, this.vx);
                this.vx = Constants.MISSILE_SIZE * Math.cos(v_angle);
                this.vy = Constants.MISSILE_SIZE * Math.sin(v_angle);
            }
        };
        Missile.prototype.receive = function (x) {
            if (x === null)
                throw ("null argument");
            switch (x) {
                case Command.ROTATE_LEFT:
                    _super.prototype.rotateLeft.call(this);
                    break;
                case Command.ROTATE_RIGHT:
                    _super.prototype.rotateRight.call(this);
                    break;
                case Command.ENGINE_ON:
                    this.engine = true;
                    break;
                case Command.ENGINE_OFF:
                    this.engine = false;
                    this.ax = 0;
                    this.ay = 0;
                    break;
            }
            return null;
        };
        Missile.prototype.isEngineOn = function () {
            return this.engine;
        };
        Missile.prototype.onHit = function (other) {
            if (other === null) {
                this.commander.incWasted();
            }
            else {
                if (this.commander === other.getCommander()) {
                    this.commander.incFriendlyFire();
                }
                else {
                    this.commander.incOnTarget();
                }
            }
            this.destroyed = true;
        };
        Missile.prototype.getRadius = function () {
            return Constants.MISSILE_RADIUS;
        };
        Missile.prototype.getMissilePath = function () {
            var i = this.p;
            var it = Constants.MISSILE_TRACE_LENGTH;
            var t = this;
            return {
                previous: function () {
                    i = (i - 1) < 0 ? Constants.MISSILE_TRACE_LENGTH - 1 : (i - 1);
                    return it-- > 0 && t.xpoints[i] != -1 && t.ypoints[i] != -1;
                },
                getIteration: function () {
                    return it;
                },
                getX: function () {
                    return t.xpoints[i];
                },
                getY: function () {
                    return t.ypoints[i];
                }
            };
        };
        return Missile;
    })(Actor);
    Actors.Missile = Missile;
    ;
    var MissileContext = (function (_super) {
        __extends(MissileContext, _super);
        function MissileContext(leader, x, y, dir) {
            _super.call(this, leader, -1, -1);
            this.a = new Missile(leader, x, y, dir);
        }
        MissileContext.prototype.tick = function (dt) {
            this.a.tick(dt);
        };
        MissileContext.prototype.receive = function (x) {
            return this.a.receive(x);
        };
        MissileContext.prototype.accept = function (v) {
            this.a.accept(v);
        };
        MissileContext.prototype.getRadius = function () {
            return this.a.getRadius();
        };
        MissileContext.prototype.intersects = function (b) {
            return this !== b && this.a.intersects(b);
        };
        MissileContext.prototype.onHit = function (other) {
            if (this.a instanceof Missile) {
                this.a.onHit(other);
                this.a = new Explosion(this.a.getCommander(), this.a.getX(), this.a.getY());
            }
            else {
                this.a.onHit(other);
            }
        };
        MissileContext.prototype.isUseless = function () {
            return this.a.isUseless();
        };
        MissileContext.prototype.isCollidable = function () {
            return this.a.isCollidable();
        };
        MissileContext.prototype.toRadarEvent = function () {
            return this.a.toRadarEvent();
        };
        MissileContext.prototype.isOutOfBounds = function () {
            return this.a.isOutOfBounds();
        };
        MissileContext.prototype.getX = function () {
            return this.a.getX();
        };
        MissileContext.prototype.getY = function () {
            return this.a.getY();
        };
        MissileContext.prototype.getVx = function () {
            return this.a.getVx();
        };
        MissileContext.prototype.getVy = function () {
            return this.a.getVy();
        };
        MissileContext.prototype.getAngle = function () {
            return this.a.getAngle();
        };
        return MissileContext;
    })(Actor);
    ;
})(Actors || (Actors = {}));
;
//# sourceMappingURL=actors.js.map