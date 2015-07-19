var FPS = 20;
var maxTick = 200;
var delta = 1;
var Main;
(function (Main) {
    function factory(commander, c) {
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
    function init() {
        var canvas = document.getElementsByTagName('canvas')[0];
        var ctx = canvas.getContext('2d');
        canvas.width = Constants.UNIVERSE_WIDTH;
        canvas.height = Constants.UNIVERSE_HEIGHT;
        var border_width = 1;
        canvas.style.left = (window.innerWidth - Constants.UNIVERSE_WIDTH + 2 * border_width) / 2 + 'px';
        canvas.style.top = (window.innerHeight - Constants.UNIVERSE_HEIGHT + 2 * border_width) / 2 + 'px';
        var a = new RandomCommander(Constants.CYAN);
        var b = new PracticeCommander(Constants.YELLOW);
        var parameters = document.URL.split('?');
        if (parameters.length > 1) {
            parameters = parameters[1].split('&');
            for (var i = 0; i < parameters.length; ++i) {
                var tmp = parameters[i].split('=');
                if (tmp.length > 1) {
                    var option = tmp[0], value = tmp[1];
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
                        default:
                            console.error("Unknown option: " + parameters[i]);
                            break;
                    }
                }
            }
        }
        var u = new Universe();
        u.setup(a, b);
        u.run(ctx);
    }
    Main.init = init;
    ;
})(Main || (Main = {}));
;
window.onload = function () {
    Main.init();
};
//# sourceMappingURL=main.js.map