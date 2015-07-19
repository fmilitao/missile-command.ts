var toRads = function (x) { return (x * Math.PI / 180); };
var Painter = (function () {
    function Painter(g) {
        this.g = g;
        this.g.font = '12px sans-serif';
    }
    Painter.prototype.paint = function (ca, cb, actors, tick, max, fps, elapsed) {
        this.g.clearRect(0, 0, Constants.UNIVERSE_WIDTH, Constants.UNIVERSE_HEIGHT);
        this.g.save();
        this.g.translate(.5, .5);
        for (var _i = 0; _i < actors.length; _i++) {
            var a = actors[_i];
            a.accept(this);
        }
        var ctx = this.g;
        var f = 16;
        var padding = 5;
        var h = 0 + padding;
        ctx.fillStyle = 'white';
        ctx.fillText("Time: " + (elapsed / 1000).toFixed(2) + "s", padding, h += f);
        ctx.fillText("Ticks: " + tick + (max == -1 ? "" : " / " + max), padding, h += f);
        ctx.fillText("FPS: " + fps.toFixed(0) + (FPS === -1 ? "" : " / " + FPS), padding, h += f);
        h += f;
        var first = ca, second = cb;
        var s_diff = ca.getCapitalshipDamage() - cb.getCapitalshipDamage();
        var l_diff = ca.getLauncherDamage() - cb.getLauncherDamage();
        if (s_diff != 0) {
            first = s_diff > 0 ? cb : ca;
            second = s_diff > 0 ? ca : cb;
        }
        else {
            if (l_diff != 0) {
                first = l_diff > 0 ? cb : ca;
                second = l_diff > 0 ? ca : cb;
            }
        }
        ctx.fillStyle = first.getTeamColor().toString();
        ctx.fillText("1. " +
            first.getTeamName() + " [" +
            (first.getCapitalshipDamage() - second.getCapitalshipDamage()) + "," +
            (first.getLauncherDamage() - second.getLauncherDamage())
            + "]", padding, h += f);
        ctx.fillStyle = second.getTeamColor().toString();
        ctx.fillText(((l_diff == 0 && s_diff == 0) ? "1. " :
            "2. ") + second.getTeamName(), padding, h += f);
        h = Constants.UNIVERSE_HEIGHT / 2 + Constants.CAPITALSHIP_RADIUS + 2 * f;
        h = this.printCommander(ca, padding, h, f);
        h += f;
        h = this.printCommander(cb, padding, h, f);
        this.g.restore();
    };
    Painter.prototype.format = function (str, n) {
        if (str.length < n) {
            return this.format(" " + str, n);
        }
        return str;
    };
    Painter.prototype.printCommander = function (c, p, h, f) {
        this.g.fillStyle = c.getTeamColor().toString();
        this.g.fillText("Damage[ S:" + this.format(c.getCapitalshipDamage() + '', 3) +
            " | L:" + this.format(c.getLauncherDamage() + '', 3) + " ]", p, h += f);
        this.g.fillText("Missiles[ " + this.format(c.getInFlight() + '', 3) +
            " / " + this.format(c.getLaunched() + '', 3) + " ]", p, h += f);
        this.g.fillText("[ K:"
            + this.format(c.getOnTarget() + '', 3) +
            " | D:"
            + this.format(c.getWasted() + '', 3) +
            " | FF: "
            + this.format(c.getFriendlyFire() + '', 3) +
            " ]", p, h += f);
        var t = c.getLaunched() - c.getInFlight();
        if (t != 0) {
            this.g.fillText("[ "
                + ((c.getOnTarget() / t).toFixed(2) + '') +
                " | "
                + ((c.getWasted() / t).toFixed(2) + '') +
                " | "
                + ((c.getFriendlyFire() / t).toFixed(2) + '') +
                " ]", p, h += f);
        }
        else {
            h += f;
        }
        return h;
    };
    Painter.prototype.visitMissile = function (s) {
        var ctx = this.g;
        var path = s.getMissilePath();
        var x = s.getX();
        var y = s.getY();
        var w = Constants.MISSILE_RADIUS;
        var a = s.getAngle();
        var team = s.getCommander().getTeamColor();
        var darker = team.darker();
        var trace = darker.toString();
        ctx.lineWidth = 3;
        while (path.previous()) {
            ctx.strokeStyle = trace;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(path.getX(), path.getY());
            ctx.stroke();
            x = path.getX();
            y = path.getY();
            trace = darker.alpha(Math.round(255 * (path.getIteration() / Constants.MISSILE_TRACE_LENGTH)));
        }
        x = s.getX();
        y = s.getY();
        ctx.fillStyle = team.toString();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.8;
        if (s.isEngineOn()) {
            ctx.strokeStyle = team.darker().toString();
        }
        ctx.beginPath();
        ctx.arc(x, y, w, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo((x + Math.cos(a) * w), (y - Math.sin(a) * w));
        ctx.stroke();
    };
    Painter.prototype.visitLauncher = function (s) {
        var ctx = this.g;
        var x = s.getX();
        var y = s.getY();
        var w = Constants.LAUNCHER_RADIUS;
        var c = s.getCommander().getTeamColor();
        if (s.isCooling()) {
            c = c.darker();
        }
        ctx.fillStyle = c.toString();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - w, y - w / 2, w * 2, w);
        ctx.fill();
        ctx.stroke();
    };
    Painter.prototype.visitCapitalship = function (s) {
        var ctx = this.g;
        var x = s.getX();
        var y = s.getY();
        var w = Constants.CAPITALSHIP_RADIUS;
        var c = s.getCommander().getTeamColor();
        ctx.fillStyle = c.alpha(Math.floor(Math.random() * 80) + (120 - 80));
        ctx.strokeStyle = c.alpha(Math.floor(Math.random() * 80) + (120 - 80));
        ctx.beginPath();
        ctx.arc(x, y, w, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        w = w / 2;
        ctx.fillStyle = c.darker().toString();
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(x, y, w, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'black';
        ctx.fillStyle = c.toString();
        ctx.beginPath();
        ctx.rect(x - w, y - w / 8, w * 2, w / 4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(x - w / 8, y - w, w / 4, w * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = c.darker().darker().toString();
        ctx.beginPath();
        ctx.arc(x, y, w / 2, 0, 2 * Math.PI);
        ctx.fill();
        w = w / 2;
        ctx.fillStyle = c.toString();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, w, toRads(0 + 20), toRads(0 + 20 + 50));
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, w, toRads(90 + 20), toRads(90 + 20 + 50));
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, w, toRads(180 + 20), toRads(180 + 20 + 50));
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, w, toRads(270 + 20), toRads(270 + 20 + 50));
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(x, y, w, 0, 2 * Math.PI);
        ctx.stroke();
    };
    Painter.prototype.visitExplosion = function (e) {
        var ctx = this.g;
        var x = e.getX();
        var y = e.getY();
        var min = 2;
        var n = Constants.EXPLOSION_OVALS;
        while (n-- > 0) {
            ctx.fillStyle = new Color(255, (Math.random() > 0.5 ? 255 : 0), 0).alpha(Math.floor(Math.random() * 80) + (110 - 80));
            var w = Math.random() * (Constants.EXPLOSION_SIZE - min) + min;
            var h = Math.random() * (Constants.EXPLOSION_SIZE - min) + min;
            this.ellipse(x, y, w, h);
        }
    };
    Painter.prototype.ellipse = function (cx, cy, rx, ry) {
        var context = this.g;
        context.save();
        context.beginPath();
        context.translate(cx - rx, cy - ry);
        context.scale(rx, ry);
        context.arc(1, 1, 1, 0, 2 * Math.PI);
        context.restore();
        context.fill();
    };
    return Painter;
})();
;
//# sourceMappingURL=gui.js.map