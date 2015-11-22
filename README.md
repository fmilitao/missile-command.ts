#missile-command.ts

Quick port from Java to TypeScript of an old 15-214 homework. Main difference is that this version is single-threaded so it does not need any synchronization primitives. (Meaning that it does not include the challenging bits of the homework.) Beyond that change, the code remains largely identical except for the drawing code that uses HTML5 canvas instead of Java AWT.
Only includes the sample commanders. Also note that this version appears to be much more taxing on the CPU than the original Java version.

URL options (using the format: `?OPTION1=VALUE1&OPTION2=VALUE2`):

 * `fps` {number, default=20}, target frames-per-second. If set to `-1` it will attempt the maximum possible by the CPU.
 * `maxTicks` {number, default=200}, stops the simulation after that many ticks (i.e. simulation iterations). If set to `-1` will run forever.
 * `dt` {number, default=1}, time difference to use on each frame. If set to `-1` will use time difference between frames.
 * `left`, `right` {string}, changes the left/right commanders. Possible values are: `wait`, `practice`, `random`.

Online demo:
[(default mode)](http://fmilitao.github.io/missile-command.ts/index.html),
[(random mode)](http://fmilitao.github.io/missile-command.ts/index.html?maxTick=400&fps=30&left=random&right=random),
[(fast and longer mode)](http://fmilitao.github.io/missile-command.ts/index.html?maxTick=3000&fps=-1).

Screenshots of the original Java game:
[screenshot1](http://fmilitao.github.io/missile-command.ts/mc1.png),
[screenshot2](http://fmilitao.github.io/missile-command.ts/mc2.png).
TypeScript version should look mostly the same, although there are some minor differences on the font used and some "blurriness" on the lines of the HTML5 canvas that I was unable to fix completely.
