var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
;
var Commander = (function () {
    function Commander(color) {
        this.color = color;
        this.capitalshipDamage = 0;
        this.launchersDamage = 0;
        this.launched = 0;
        this.friendlyfire = 0;
        this.ontarget = 0;
        this.wasted = 0;
    }
    Commander.prototype.setRadio = function (rt) {
        this.radio = rt;
    };
    Commander.prototype.addRadioCommand = function (c, e, d) {
        return this.radio.sendCommand(c, e, d);
    };
    Commander.prototype.getTeamName = function () { throw "abstract"; };
    Commander.prototype.getTeamColor = function () {
        return this.color;
    };
    Commander.prototype.update = function (tick, reading) { throw "abstract"; };
    Commander.prototype.getCapitalshipDamage = function () { return this.capitalshipDamage; };
    Commander.prototype.getLaunched = function () { return this.launched; };
    Commander.prototype.getFriendlyFire = function () { return this.friendlyfire; };
    Commander.prototype.getWasted = function () { return this.wasted; };
    Commander.prototype.getOnTarget = function () { return this.ontarget; };
    Commander.prototype.getLauncherDamage = function () { return this.launchersDamage; };
    Commander.prototype.getInFlight = function () { return this.launched - this.ontarget - this.wasted - this.friendlyfire; };
    Commander.prototype.incCapitalshipDamage = function () { ++this.capitalshipDamage; };
    Commander.prototype.incLauncherDamage = function () { ++this.launchersDamage; };
    Commander.prototype.incLaunched = function () { ++this.launched; };
    Commander.prototype.incFriendlyFire = function () { ++this.friendlyfire; };
    Commander.prototype.incWasted = function () { ++this.wasted; };
    Commander.prototype.incOnTarget = function () { ++this.ontarget; };
    return Commander;
})();
;
var PracticeCommander = (function (_super) {
    __extends(PracticeCommander, _super);
    function PracticeCommander(c) {
        _super.call(this, c);
    }
    PracticeCommander.prototype.update = function (current_tick, report) {
        var commands = [];
        var x = 0;
        for (var _i = 0; _i < report.length; _i++) {
            var e = report[_i];
            if (!e.isOnSameTeam(this))
                continue;
            if (e.isCapitalship()) {
                x = e.getX();
                continue;
            }
            if (e.isLauncher()) {
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
                        commands.push(this.addRadioCommand(this, e, Random.nextBoolean() ? Command.ROTATE_RIGHT : Command.ROTATE_LEFT));
                    }
                }
                else {
                    commands.push(this.addRadioCommand(this, e, Command.ENGINE_ON));
                }
                continue;
            }
        }
        return commands;
    };
    PracticeCommander.prototype.getTeamName = function () {
        return "Practice";
    };
    return PracticeCommander;
})(Commander);
;
var RandomCommander = (function (_super) {
    __extends(RandomCommander, _super);
    function RandomCommander(c) {
        _super.call(this, c);
    }
    RandomCommander.prototype.update = function (tick, events) {
        var commands = [];
        for (var _i = 0; _i < events.length; _i++) {
            var e = events[_i];
            if (!e.isOnSameTeam(this))
                continue;
            if (e.isLauncher() && (Math.random() >= 0.4)) {
                commands.push(this.addRadioCommand(this, e, Command.FIRE_MISSILE));
                continue;
            }
            if (e.isMissile()) {
                commands.push(this.addRadioCommand(this, e, Random.nextCommand()));
            }
        }
        return commands;
    };
    RandomCommander.prototype.getTeamName = function () {
        return "Random";
    };
    return RandomCommander;
})(Commander);
;
var WaitCommander = (function (_super) {
    __extends(WaitCommander, _super);
    function WaitCommander(c) {
        _super.call(this, c);
    }
    WaitCommander.prototype.update = function (tick, reading) {
        return [];
    };
    WaitCommander.prototype.getTeamName = function () {
        return "Wait";
    };
    return WaitCommander;
})(Commander);
;
//# sourceMappingURL=commanders.js.map