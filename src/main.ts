
let FPS = 20;
let maxTick = 200;
let delta = 1;

module Main {

    function factory(commander: string, c: Color): Commander {
        switch (commander.toLowerCase()) {
            case "random":
                return new RandomCommander(c);
            case "wait":
                return new WaitCommander(c);
            case "practice":
                return new PracticeCommander(c);
            default:
                throw "Unknow commander: " + commander;
        }
    }

    export function init() {
        const canvas = <HTMLCanvasElement>document.getElementsByTagName('canvas')[0];
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        canvas.width = Constants.UNIVERSE_WIDTH;
        canvas.height = Constants.UNIVERSE_HEIGHT;
        const border_width = 1;
        canvas.style.left = (window.innerWidth - Constants.UNIVERSE_WIDTH + 2 * border_width) / 2 + 'px';
        canvas.style.top = (window.innerHeight - Constants.UNIVERSE_HEIGHT + 2 * border_width) / 2 + 'px';

        let a = new RandomCommander(Constants.CYAN);
        let b = new PracticeCommander(Constants.YELLOW);

        let parameters = document.URL.split('?');
        if (parameters.length > 1) {
            parameters = parameters[1].split('&');
            for (let i = 0; i < parameters.length; ++i) {
                const tmp = parameters[i].split('=');
                if (tmp.length > 1) {
                    const [option, value] = tmp;
                    switch (option) {
                        case 'maxTick':
                            maxTick = parseInt(value);
                            break;
                        case 'fps':
                            FPS = parseInt(value);
                            break;
                        case 'dt':
                            delta = parseInt(value);
                            break;
                        case 'left':
                            a = factory(value, Constants.CYAN);
                            break;
                        case 'right':
                            b = factory(value, Constants.PINK);
                            break;
                        default: // no other options
                            console.error("Unknown option: " + parameters[i]);
                            break;
                    }
                }
            }
        }

        const u = new Universe();
        u.setup(a, b);
        u.run(ctx);
    };

};

window.onload = function() {
    Main.init();
};
