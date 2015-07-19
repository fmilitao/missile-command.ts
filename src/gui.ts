
const toRads = (x: number) => (x * Math.PI / 180);

class Painter implements Actors.ActorVisitor {

    constructor(
        private g: CanvasRenderingContext2D
        ) {
        // empty
        this.g.font = '12px sans-serif';
    }

    paint(ca: Commander, cb: Commander, actors: Actors.Actor[],
        tick: number, max: number, fps: number, elapsed: number) {

        this.g.clearRect(0, 0, Constants.UNIVERSE_WIDTH, Constants.UNIVERSE_HEIGHT);

        // to avoid blurry lines, see: http://stackoverflow.com/questions/8696631/canvas-drawings-are-blurry
        this.g.save();
        this.g.translate(.5, .5);

        // get current information from the known Universe

        // draws game actors
        for (const a of actors) {
            a.accept(this);
        }

        // paints the game HUD, above actors (all on left side)
        const ctx = this.g;
        const f = 16; // set above.
        const padding = 5;
        let h = 0 + padding;
        //warning (intentional) side-effects on arguments!

        ctx.fillStyle = 'white';
        ctx.fillText("Time: " + (elapsed / 1000).toFixed(2) + "s", padding, h += f);
        ctx.fillText("Ticks: " + tick + (max == -1 ? "" : " / " + max), padding, h += f);

        // show current and expected (if everything is running fine) FPS
        ctx.fillText("FPS: " + fps.toFixed(0) + (FPS === -1 ? "" : " / " + FPS), padding, h += f);

        h += f;

        // score board
        let first = ca, second = cb;

        // first compare capital ship damage
        const s_diff = ca.getCapitalshipDamage() - cb.getCapitalshipDamage();
        const l_diff = ca.getLauncherDamage() - cb.getLauncherDamage();
        if (s_diff != 0) {
            first = s_diff > 0 ? cb : ca;
            second = s_diff > 0 ? ca : cb;
        } else {
            // they are equal
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
        ctx.fillText(
            ((l_diff == 0 && s_diff == 0) ? "1. " :
                "2. ") + second.getTeamName(), padding, h += f);

        h = Constants.UNIVERSE_HEIGHT / 2 + Constants.CAPITALSHIP_RADIUS + 2 * f;

        h = this.printCommander(ca, padding, h, f);

        h += f;

        h = this.printCommander(cb, padding, h, f);

        this.g.restore();
    }

    format(str: string, n: number): string {
        if (str.length < n) {
            return this.format(" " + str, n);
        }
        return str;
    }

    printCommander(c: Commander, p: number, h: number, f: number): number {
        this.g.fillStyle = c.getTeamColor().toString();

        // Damage suffered
        this.g.fillText(
            "Damage[ S:" + this.format(c.getCapitalshipDamage() + '', 3) +
            " | L:" + this.format(c.getLauncherDamage() + '', 3) + " ]"
            , p, h += f);

        // Missile stats
        this.g.fillText(
            "Missiles[ " + this.format(c.getInFlight() + '', 3) +
            " / " + this.format(c.getLaunched() + '', 3) + " ]",
            p, h += f);

        this.g.fillText(
            "[ K:"
            + this.format(c.getOnTarget() + '', 3) +
            " | D:"
            + this.format(c.getWasted() + '', 3) +
            " | FF: "
            + this.format(c.getFriendlyFire() + '', 3) +
            " ]", p, h += f);

        const t = c.getLaunched() - c.getInFlight();
        if (t != 0) {
            this.g.fillText(
                "[ "
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
    }

    visitMissile(s: Actors.Missile): void {
        const ctx = this.g;

        // Missile's path
        const path = s.getMissilePath();
        let x = s.getX();
        let y = s.getY();
        const w = Constants.MISSILE_RADIUS;
        const a = s.getAngle();
        const team = s.getCommander().getTeamColor();
        const darker = team.darker();

        let trace = darker.toString();
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

        // Missile (as a circle)
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
    }

    visitLauncher(s: Actors.Launcher): void {
        const ctx = this.g;
        const x = s.getX();
        const y = s.getY();
        const w = Constants.LAUNCHER_RADIUS;
        let c = s.getCommander().getTeamColor();

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

    }

    visitCapitalship(s: Actors.Capitalship): void {
        const ctx = this.g;

        const x = s.getX();
        const y = s.getY();
        let w = Constants.CAPITALSHIP_RADIUS;
        const c = s.getCommander().getTeamColor();

        // shields, flickery
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

    }

    visitExplosion(e: Actors.Explosion): void {
        const ctx = this.g;
        const x = e.getX();
        const y = e.getY();

        // minimum size on the explosion
        const min = 2;
        let n = Constants.EXPLOSION_OVALS;
        while (n-- > 0) {
            // explosions are RED (0xff000) and YELLOW (0xffff00)
            ctx.fillStyle = new Color(
                255, // RED and YELLOW equally probable
                (Math.random() > 0.5 ? 255 : 0),
                0).alpha(
                    // some transparency
                    Math.floor(Math.random() * 80) + (110 - 80)
                    );
            const w = Math.random() * (Constants.EXPLOSION_SIZE - min) + min;
            const h = Math.random() * (Constants.EXPLOSION_SIZE - min) + min;

            this.ellipse(x, y, w, h);
        }
    }

    // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
    ellipse(cx: number, cy: number, rx: number, ry: number) {
        const context = this.g;
        context.save();
        context.beginPath();

        context.translate(cx - rx, cy - ry);
        context.scale(rx, ry);
        context.arc(1, 1, 1, 0, 2 * Math.PI);

        context.restore();
        context.fill();
    }

};
