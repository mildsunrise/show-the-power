# Show the power

(No, I didn't bother to put a name to this.)

This is a very simple application that, well, shows the power ~~wasted~~ spent by your computer (or a part of it) as reported by Linux.

RAPL devices are used to lookup the power, so this won't work unless your laptop has them. When you run
`server.js`, it'll try to detect a RAPL device.

If for some reason it didn't detect the RAPL device, or you have more than one, you can pass it explicitely
through the `ENERGY_FILE` environment variable:

    $ ENERGY_FILE=/sys/class/powercap/intel-rapl:0/energy_uj node server


## Tweaking

`index.html` has all the styling and code to paint the graph. It uses d3.js to do all the work, and it has some
parameters at the top you can tweak.

If you want to change the rate at which the power is read, edit `samplingTime` at `server.js`.
