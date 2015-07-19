
interface RadarStation {

    update(tick: number, report: RadarEvent[]): RadioCommand[];

};

class Commander implements RadarStation {

    private radio: RadioTransmitter;

    private capitalshipDamage: number; // damage taken (capitalship)
    private launchersDamage: number; // damage taken (launchers)
    private launched: number; // missiles launched
    private friendlyfire: number; // missiles lost to "friendly" collisions
    private ontarget: number; // missiles that hit the other team
    private wasted: number; // missiles lost due to hitting the Universe's bounds

    constructor(
        private color: Color
        ) {
        // stats initialization
        this.capitalshipDamage = 0;
        this.launchersDamage = 0;
        this.launched = 0;
        this.friendlyfire = 0;
        this.ontarget = 0;
        this.wasted = 0;
    }

    setRadio(rt: RadioTransmitter) {
        this.radio = rt;
    }

    addRadioCommand(c: Commander, e: RadarEvent, d: Command) {
        return this.radio.sendCommand(c, e, d);
    }

    getTeamName(): string { throw "abstract"; }
    getTeamColor() {
        return this.color;
    }


    update(tick: number, reading: RadarEvent[]): RadioCommand[] { throw "abstract"; }

    // stats stuff

    getCapitalshipDamage() { return this.capitalshipDamage; }
    getLaunched() { return this.launched; }
    getFriendlyFire() { return this.friendlyfire; }
    getWasted() { return this.wasted; }
    getOnTarget() { return this.ontarget; }
    getLauncherDamage() { return this.launchersDamage; }
    getInFlight() { return this.launched - this.ontarget - this.wasted - this.friendlyfire; }

    incCapitalshipDamage() { ++this.capitalshipDamage; }
    incLauncherDamage() { ++this.launchersDamage; }
    incLaunched() { ++this.launched; }
    incFriendlyFire() { ++this.friendlyfire; }
    incWasted() { ++this.wasted; }
    incOnTarget() { ++this.ontarget; }

};

class PracticeCommander extends Commander {

    constructor(c: Color) {
        super(c);
    }

    update(current_tick: number, report: RadarEvent[]): RadioCommand[] {

        const commands: RadioCommand[] = [];
        let x = 0;

        for (const e of report) {

            // ignores other team's events (this commander is
            // oblivious to the enemy's actions)
            if (!e.isOnSameTeam(this))
                continue;

            // FIXME: this assumes capitalship comes first!
            if (e.isCapitalship()) {
                x = e.getX();
                continue;
            }

            // some launcher from our team, fire(?)
            if (e.isLauncher()) {
                // some magic values to split the launches
                if (e.getY() > Constants.UNIVERSE_HEIGHT / 2) {
                    if (current_tick % 41 == 0) {
                        commands.push(this.addRadioCommand(this, e, Command.FIRE_MISSILE));
                    }
                }
                else {
                    if (current_tick % 23 == 0) {
                        commands.push(this.addRadioCommand(this, e, Command.FIRE_MISSILE));
                    }
                }
                continue;
            }

            if (e.isMissile()) {
                if (Math.abs(x - e.getX()) < Constants.UNIVERSE_WIDTH / 4) {
                    if (Math.random() > 0.9) {
                        commands.push(this.addRadioCommand(this, e,
                            Random.nextBoolean() ? Command.ROTATE_RIGHT : Command.ROTATE_LEFT));
                    }
                }
                else {
                    commands.push(this.addRadioCommand(this, e, Command.ENGINE_ON));
                }
                continue;
            }

        }

        return commands;
    }

    getTeamName() {
        return "Practice";
    }

};

class RandomCommander extends Commander {

    constructor(c: Color) {
        super(c);
    }

    update(tick: number, events: RadarEvent[]): RadioCommand[] {
        const commands: RadioCommand[] = [];
        for (const e of events) {
            // ignores other team's events (this commander is
            // oblivious to the enemy's actions)
            if (!e.isOnSameTeam(this))
                continue;

            // some launcher from our team, fire(?)
            if (e.isLauncher() && (Math.random() >= 0.4)) {
                commands.push(this.addRadioCommand(this, e, Command.FIRE_MISSILE));
                continue;
            }

            // some missile from our team, send something, even if useless
            if (e.isMissile()) {
                commands.push(this.addRadioCommand(this, e, Random.nextCommand()));
            }
        }
        return commands;
    }

    getTeamName() {
        return "Random";
    }

};

class WaitCommander extends Commander {

    constructor(c: Color) {
        super(c);
    }

    update(tick: number, reading: RadarEvent[]): RadioCommand[] {
        return []; // does nothing
    }

    getTeamName() {
        return "Wait";
    }

};
