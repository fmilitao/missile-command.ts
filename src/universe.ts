
interface RadioTransmitter {

    sendCommand(sender: Commander, destination: RadarEvent, action: Command): RadioCommand;

};

class Universe implements RadioTransmitter {

    private actors: Actors.Actor[];
    private stations: RadarStation[];

    private a: Commander;
    private b: Commander;

    private tick: number;
    private start: number;

    private last: number;
    private p: Painter;

    constructor() {
        this.actors = [];
        this.stations = [];
    }

    // deploys all actors in the game world with a predetermined layout
    setup(a: Commander, b: Commander) {
        if (a === null || b === null)
            throw "null argument(s)";

        this.stations = [a, b];

        a.setRadio(this);
        b.setRadio(this);

        this.actors = [];
        this.a = a;
        this.b = b;

        // universe setup

        const padding = 10; // empirical value

        // places the two opposing Capitalships on opposing sides

        const cs = new Actors.Capitalship(a,
            0 + Constants.CAPITALSHIP_RADIUS + padding, // left side x
            Constants.UNIVERSE_HEIGHT / 2); //y
        this.actors.push(cs);
        const cs2 = new Actors.Capitalship(b,
            Constants.UNIVERSE_WIDTH - Constants.CAPITALSHIP_RADIUS - padding, // right side x
            Constants.UNIVERSE_HEIGHT / 2); // y
        this.actors.push(cs2);

        // setup Launchers

        // number of launchers to create
        // remove 2*padding (for top/bottom) and make distance between
        // launchers as LAUNCHER_SIZE*2 so missiles have enough room to fly
        let n = (Constants.UNIVERSE_HEIGHT - padding * 2) / (Constants.LAUNCHER_SIZE * 2);

        // launchers' position on the x axis
        const x = (Constants.CAPITALSHIP_SIZE + padding) * 2;
        // initial launcher's y axis (top padding + LAUNCHER_SIZE) because
        // we setup the center position, thus top will have LAUNCHER_SIZE/2
        // (+padding) room for missiles to fly (remainder of division is ignore
        // and may lead - for some heights - to larger gaps in the bottom
        let y = padding + Constants.LAUNCHER_SIZE;

        while (n-- > 0) {
            // even/odd behavior on placing launcher on front (or back) line
            const delta = (n % 2 == 0 ? Constants.CAPITALSHIP_SIZE : 0);

            // a's launchers start facing right
            const l1 = new Actors.Launcher(a,
                0 + x + delta,
                y,
                0);
            this.actors.push(l1);

            // b's launchers start facing left
            const l2 = new Actors.Launcher(b,
                Constants.UNIVERSE_WIDTH - x - delta,
                y,
                0 + Constants.MAX_DIRECTIONS / 2);
            this.actors.push(l2);

            y += Constants.LAUNCHER_SIZE * 2;
        }

    }

    run(ctx: CanvasRenderingContext2D) {

        this.start = new Date().getTime();
        this.last = 0;
        this.tick = 0;
        this.p = new Painter(ctx);

        if (FPS === -1) {
            const u = this;
            function r() {
                u.update();
                requestAnimationFrame(r);
            };
            r();
        } else {
            setInterval(
                () => this.update(),
                1000 / FPS
                );
        }

    }

    update() {

        this.tick = this.tick + 1;

        //
        // draw
        //
        const now = new Date().getTime();
        const time = now - this.start;

        if (maxTick < 0 || this.tick <= maxTick) {

            const dt = now - this.last;
            this.p.paint(
                this.a, this.b, this.actors,
                this.tick, maxTick, // ticks
                1000 / dt //fps
                , time);

            this.last = now;

            //
            // do tick
            //

            const t = delta === -1 ? dt / 10 : delta;
            for (const a of this.actors) {
                a.tick(t);
            }

            // checks collisions
            for (const a of this.actors) {
                // check for collisions with other actors
                for (const aa of this.actors) {
                    // if no (longer) collidable, go to next actor in list
                    if (!a.isCollidable())
                        break;
                    if (aa.isCollidable() && a.intersects(aa)) {
                        a.onHit(aa);
                        aa.onHit(a);
                    }
                }
                // if still here, check Universe bounds
                if (a.isCollidable() && a.isOutOfBounds()) {
                    // there is no actor causing the hit which is flagged
                    // by a null argument
                    a.onHit(null);
                }
            }

            this.actors = this.actors.filter(x => !x.isUseless());

            //
            // update worlds
            //

            // build new report
            const report: RadarEvent[] = [];
            for (const a of this.actors) {
                const event = a.toRadarEvent();
                // null event signals that the actor cannot/should not
                // be tracked by radar
                if (event !== null) {
                    report.push(event);
                }
            }

            // build new actions from stations
            const commands: RadioCommand[] = [];
            for (const r of this.stations) {
                commands.concat(r.update(this.tick, report))
                    .forEach(x => commands.push(x));
            }

            // apply commands
            for (const radio of commands) {
                const result = radio.target.receive(radio.action);
                if (result !== null) {
                    this.actors.push(result);
                }
            }

        }

    }

    sendCommand(sender: Commander, destination: RadarEvent, action: Command): RadioCommand {
        if (sender === null || destination === null || action === null)
            throw "null argument(s)";

        if (!destination.isOnSameTeam(sender))
            throw "not on the same team!";

        return new RadioCommand(destination, action);
    }

};
