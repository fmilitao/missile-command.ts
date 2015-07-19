
module Actors {

    // unique identifiers for actors, convenient for indexing, etc.
    let ID: number = 0;

    export interface ActorVisitor {

        visitMissile(x: Missile): void;

        visitLauncher(x: Launcher): void;

        visitCapitalship(x: Capitalship): void;

        visitExplosion(x: Explosion): void;

    };

    //
    // Actor Base class
    //

    export class Actor {

        protected actorID: number;
        protected vx: number;
        protected vy: number;
        protected ax: number;
        protected ay: number;
        protected dir: number;

        constructor(
            protected commander: Commander,
            protected x: number,
            protected y: number,
            direction?: number) {
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

        getCommander() {
            return this.commander;
        }

        getX() { return this.x; }
        getY() { return this.y; }
        getVx() { return this.vx; }
        getVy() { return this.vy; }

        getAngle() {
            return this.dir * Constants.DIRECTION_DELTA;
        }

        tick(dt: number) {
            this.x = this.x + this.vx * dt + this.ax / 2 * dt * dt;
            this.y = this.y + this.vy * dt + this.ay / 2 * dt * dt;

            this.vx = this.vx + this.ax * dt;
            this.vy = this.vy + this.ay * dt;
        }

        isUseless() {
            return false;
        }

        // FIXME: typescript 1.6 will allow abstract methods
        receive(x: Command): Actor {
            throw "abstract";
        }
        accept(v: ActorVisitor): void {
            throw "abstract";
        }
        getRadius(): number {
            throw "abstract";
        }
        onHit(other: Actor): void {
            throw "abstract";
        }

        intersects(a: Actor): boolean {
            if (this === a)
                return false;
            // all collision detection is circle based
            return (Math.pow(a.getX() - this.getX(), 2) +
                Math.pow(a.getY() - this.getY(), 2)) <=
                Math.pow(a.getRadius() + this.getRadius(), 2);
            //FIXME: likely rounding bug on collision detection not being consistent with drawing?
        }

        toRadarEvent(): RadarEvent {
            return new RadarEvent(this);
        }

        getID() {
            return this.actorID;
        }

        isCollidable() {
            return !this.isUseless();
        }

        isOutOfBounds() {
            return (this.getX() - this.getRadius()) < 0 ||
                (this.getY() - this.getRadius()) < 0 ||
                (this.getX() + this.getRadius()) >= Constants.UNIVERSE_WIDTH ||
                (this.getY() + this.getRadius()) >= Constants.UNIVERSE_HEIGHT;
        }

        rotateLeft() {
            this.dir = (this.dir + 1) % Constants.MAX_DIRECTIONS;
        }

        rotateRight() {
            this.dir = (this.dir - 1) % Constants.MAX_DIRECTIONS;
        }

        setSpeed(vel: number) {
            const a = this.getAngle();
            this.vx = vel * Math.cos(a);
            this.vy = -vel * Math.sin(a);
        }

        setAcceleration(acc: number) {
            const a = this.getAngle();
            this.ax = acc * Math.cos(a);
            this.ay = -acc * Math.sin(a);
        }

    };

    //
    // Capitalship
    //

    export class Capitalship extends Actor {

        constructor(leader: Commander, x: number, y: number) {
            super(leader, x, y);
        }

        receive(x: Command): Actor {
            //ignores all commands
            return null;
        }

        accept(v: ActorVisitor) {
            if (v === null)
                throw ("null argument");
            v.visitCapitalship(this);
        }

        onHit(other: Actor) {
            this.commander.incCapitalshipDamage();
        }

        getRadius(): number {
            return Constants.CAPITALSHIP_RADIUS;
        }

    };

    //
    // Explosion
    //

    export class Explosion extends Actor {

        private timer: number;

        constructor(leader: Commander, x: number, y: number) {
            super(leader, x, y);
            this.timer = Constants.EXPLOSION_TIME;

            // make sure explosion is inside game bounds
            if (this.x < 0)
                this.x = 0;
            if (this.x >= Constants.UNIVERSE_WIDTH)
                this.x = Constants.UNIVERSE_WIDTH - 1;

            if (this.y < 0)
                this.y = 0;
            if (this.y >= Constants.UNIVERSE_HEIGHT)
                this.y = Constants.UNIVERSE_HEIGHT - 1;

        }

        tick(dt: number) {
            this.timer -= dt;
        }

        isUseless() {
            return this.timer < 0;
        }

        receive(x: Command): Actor {
            return null;
        }

        accept(v: ActorVisitor) {
            if (v === null)
                throw ("null argument");
            v.visitExplosion(this);
        }

        getRadius() {
            return 0;
        }

        isCollidable() {
            return false;
        }

        onHit(other: Actor) {
        }

        intersects(a: Actor) {
            return false;
        }

        isOutOfBounds() {
            return false;
        }

    };

    //
    // Launcher
    //

    export class Launcher extends Actor {

        protected heat: number;

        constructor(leader: Commander, x: number, y: number, dir: number) {
            super(leader, x, y, dir);
            this.heat = 0;
        }

        receive(x: Command): Actor {
            if (x === null)
                throw ("null argument");
            switch (x) {
                case Command.FIRE_MISSILE:
                    if (!this.isCooling()) {
                        this.commander.incLaunched();
                        this.heat = Constants.LAUNCHER_COOL_OFF_TIME;
                        const a = this.getAngle();
                        // missile's location should be right at the Launcher's edge
                        // so we need to account for the radius plus a padding (1)
                        return new MissileContext(this.commander,
                            this.getX() + Math.cos(a) * (Constants.LAUNCHER_RADIUS + Constants.MISSILE_RADIUS + 1),
                            this.getY() - Math.sin(a) * (Constants.LAUNCHER_RADIUS + Constants.MISSILE_RADIUS + 1),
                            this.dir);
                    }
                    break;
                //everything else is ignored
            }
            return null;
        }

        isCooling() {
            return this.heat > 0;
        }

        accept(v: ActorVisitor) {
            if (v === null)
                throw ("null argument");
            v.visitLauncher(this);
        }

        onHit(other: Actor) {
            this.commander.incLauncherDamage();
            // hits punish the launcher more than regular launches
            this.heat = 2 * Constants.LAUNCHER_COOL_OFF_TIME;
        }

        tick(dt: number) {
            super.tick(dt);
            this.heat -= dt;
            if (this.heat < 0)
                this.heat = 0;
        }

        getRadius() {
            return Constants.LAUNCHER_RADIUS;
        }

    };

    //
    // Missile
    //

    export class Missile extends Actor {

        protected engine: boolean;
        protected destroyed: boolean;

        protected xpoints: number[];
        protected ypoints: number[];
        protected p: number;

        constructor(leader: Commander, x: number, y: number, dir: number) {
            super(leader, x, y, dir);
            this.setSpeed(Constants.MISSILE_INITIAL_VELOCITY);

            this.engine = false;
            this.destroyed = false;

            this.xpoints = new Array<number>(Constants.MISSILE_TRACE_LENGTH);
            this.ypoints = new Array<number>(Constants.MISSILE_TRACE_LENGTH);
            this.p = 0;
            for (let i = 0; i < Constants.MISSILE_TRACE_LENGTH; ++i) {
                this.xpoints[i] = -1;
                this.ypoints[i] = -1;
            }
        }

        isUseless() {
            return this.destroyed;
        }

        accept(v: ActorVisitor) {
            if (v === null)
                throw ("null argument");
            v.visitMissile(this);
        }

        tick(dt: number) {
            // path stuff (saves old position)
            this.xpoints[this.p] = this.x;
            this.ypoints[this.p] = this.y;
            this.p = (this.p + 1) % Constants.MISSILE_TRACE_LENGTH;

            // if engines ON
            if (this.engine)
                this.setAcceleration(Constants.MISSILE_ACCELERATION);

            super.tick(dt);

            // HACK: missile speed limit
            // this is an UGLY hack due to the lame collision detection algorithm
            // that uses bounding shapes. Thus, whenever the missile is moving
            // faster than its size, we cap its speed to avoid "teleports"
            // Besides potential rounding errors, it also assumes the acceleration
            // component is negligible... which might not always be true.
            if ((Math.pow(this.vx, 2) + Math.pow(this.vy, 2)) > Math.pow(Constants.MISSILE_SIZE, 2)) {
                // over-speeding
                const v_angle = Math.atan2(this.vy, this.vx);
                this.vx = Constants.MISSILE_SIZE * Math.cos(v_angle);
                this.vy = Constants.MISSILE_SIZE * Math.sin(v_angle);
            }
        }

        receive(x: Command): Actor {
            if (x === null)
                throw ("null argument");
            switch (x) {
                case Command.ROTATE_LEFT:
                    super.rotateLeft();
                    break;
                case Command.ROTATE_RIGHT:
                    super.rotateRight();
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
        }

        isEngineOn() {
            return this.engine;
        }

        onHit(other: Actor) {
            if (other === null) {
                this.commander.incWasted();
            }
            else {
                if (this.commander === other.getCommander()) {
                    this.commander.incFriendlyFire();
                } else {
                    this.commander.incOnTarget();
                }
            }
            this.destroyed = true;
        }

        getRadius() {
            return Constants.MISSILE_RADIUS;
        }

        getMissilePath() {
            let i = this.p;
            let it = Constants.MISSILE_TRACE_LENGTH;
            const t = this;

            return {
                previous: () => {
                    i = (i - 1) < 0 ? Constants.MISSILE_TRACE_LENGTH - 1 : (i - 1);
                    // does at most "it" iterations
                    return it-- > 0 && t.xpoints[i] != -1 && t.ypoints[i] != -1;
                },

                getIteration: () => {
                    return it;
                },

                getX: () => {
                    return t.xpoints[i];
                },

                getY: () => {
                    return t.ypoints[i];
                }

            };
        }
    };

    //
    // MissileContext
    //

    class MissileContext extends Actor {

        protected a: Actor;

        constructor(leader: Commander, x: number, y: number, dir: number) {
            super(leader, -1, -1);

            this.a = new Missile(leader, x, y, dir);
        }

        tick(dt: number) {
            this.a.tick(dt);
        }

        receive(x: Command) {
            return this.a.receive(x);
        }

        accept(v: ActorVisitor) {
            this.a.accept(v);
        }

        getRadius() {
            return this.a.getRadius();
        }

        intersects(b: Actor): boolean {
            return this !== b && this.a.intersects(b);
        }

        onHit(other: Actor) {
            if (this.a instanceof Missile) {
                this.a.onHit(other);
                this.a = new Explosion(this.a.getCommander(), this.a.getX(), this.a.getY());
            } else {
                this.a.onHit(other);
            }
        }

        isUseless() {
            return this.a.isUseless();
        }

        isCollidable() {
            return this.a.isCollidable();
        }

        toRadarEvent() {
            return this.a.toRadarEvent();
        }

        isOutOfBounds() {
            return this.a.isOutOfBounds();
        }

        getX() {
            return this.a.getX();
        }

        getY() {
            return this.a.getY();
        }

        getVx() {
            return this.a.getVx();
        }

        getVy() {
            return this.a.getVy();
        }

        getAngle() {
            return this.a.getAngle();
        }

    };

};
