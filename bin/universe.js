;
var Universe = (function () {
    function Universe() {
        this.actors = [];
        this.stations = [];
    }
    Universe.prototype.setup = function (a, b) {
        if (a === null || b === null)
            throw "null argument(s)";
        this.stations = [a, b];
        a.setRadio(this);
        b.setRadio(this);
        this.actors = [];
        this.a = a;
        this.b = b;
        var padding = 10;
        var cs = new Actors.Capitalship(a, 0 + Constants.CAPITALSHIP_RADIUS + padding, Constants.UNIVERSE_HEIGHT / 2);
        this.actors.push(cs);
        var cs2 = new Actors.Capitalship(b, Constants.UNIVERSE_WIDTH - Constants.CAPITALSHIP_RADIUS - padding, Constants.UNIVERSE_HEIGHT / 2);
        this.actors.push(cs2);
        var n = (Constants.UNIVERSE_HEIGHT - padding * 2) / (Constants.LAUNCHER_SIZE * 2);
        var x = (Constants.CAPITALSHIP_SIZE + padding) * 2;
        var y = padding + Constants.LAUNCHER_SIZE;
        while (n-- > 0) {
            var delta_1 = (n % 2 == 0 ? Constants.CAPITALSHIP_SIZE : 0);
            var l1 = new Actors.Launcher(a, 0 + x + delta_1, y, 0);
            this.actors.push(l1);
            var l2 = new Actors.Launcher(b, Constants.UNIVERSE_WIDTH - x - delta_1, y, 0 + Constants.MAX_DIRECTIONS / 2);
            this.actors.push(l2);
            y += Constants.LAUNCHER_SIZE * 2;
        }
    };
    Universe.prototype.run = function (ctx) {
        var _this = this;
        this.start = new Date().getTime();
        this.last = 0;
        this.tick = 0;
        this.p = new Painter(ctx);
        if (FPS === -1) {
            var u = this;
            function r() {
                u.update();
                requestAnimationFrame(r);
            }
            ;
            r();
        }
        else {
            setInterval(function () { return _this.update(); }, 1000 / FPS);
        }
    };
    Universe.prototype.update = function () {
        this.tick = this.tick + 1;
        var now = new Date().getTime();
        var time = now - this.start;
        if (maxTick < 0 || this.tick <= maxTick) {
            var dt = now - this.last;
            this.p.paint(this.a, this.b, this.actors, this.tick, maxTick, 1000 / dt, time);
            this.last = now;
            var t = delta === -1 ? dt / 10 : delta;
            for (var _i = 0, _a = this.actors; _i < _a.length; _i++) {
                var a = _a[_i];
                a.tick(t);
            }
            for (var _b = 0, _c = this.actors; _b < _c.length; _b++) {
                var a = _c[_b];
                for (var _d = 0, _e = this.actors; _d < _e.length; _d++) {
                    var aa = _e[_d];
                    if (!a.isCollidable())
                        break;
                    if (aa.isCollidable() && a.intersects(aa)) {
                        a.onHit(aa);
                        aa.onHit(a);
                    }
                }
                if (a.isCollidable() && a.isOutOfBounds()) {
                    a.onHit(null);
                }
            }
            this.actors = this.actors.filter(function (x) { return !x.isUseless(); });
            var report = [];
            for (var _f = 0, _g = this.actors; _f < _g.length; _f++) {
                var a = _g[_f];
                var event_1 = a.toRadarEvent();
                if (event_1 !== null) {
                    report.push(event_1);
                }
            }
            var commands = [];
            for (var _h = 0, _j = this.stations; _h < _j.length; _h++) {
                var r = _j[_h];
                commands.concat(r.update(this.tick, report))
                    .forEach(function (x) { return commands.push(x); });
            }
            for (var _k = 0; _k < commands.length; _k++) {
                var radio = commands[_k];
                var result = radio.target.receive(radio.action);
                if (result !== null) {
                    this.actors.push(result);
                }
            }
        }
    };
    Universe.prototype.sendCommand = function (sender, destination, action) {
        if (sender === null || destination === null || action === null)
            throw "null argument(s)";
        if (!destination.isOnSameTeam(sender))
            throw "not on the same team!";
        return new RadioCommand(destination, action);
    };
    return Universe;
})();
;
//# sourceMappingURL=universe.js.map