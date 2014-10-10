#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

var FILE = process.env.ENERGY_FILE || detectDeviceFile("/sys/class/powercap");

if (!FILE) {
  if (!FILE) {
    console.log("Couldn't detect any RAPL device. Exiting.");
    process.exit(1);
  }
}

function detectDeviceFile(rootDir) {
  try {
    var files = [];
    var devices = fs.readdirSync(rootDir);
    for (var i = 0; i < devices.length; i++) {
      var file = path.join(rootDir, devices[i], "energy_uj");
      if (fs.existsSync(file)) files.push(file);
    }

    if (files.length > 1)
      console.log("Multiple RAPL devices, will choose one at random.\nIf the power graph isn't realistic, try manually choosing another (see the README).\n");

    return files[0];
  } catch (e) {}
}


// Web server

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/d3.js", function(req, res) {
  res.sendFile(__dirname + "/d3.v3.min.js");
});

http.listen(process.env.PORT || 3000, function() {
  console.log("Using %s", FILE);
  console.log("Listening on http://localhost:%s", http.address().port);
});


// Energy / power reporting to client

var samplingTime = 250;

function getEnergyPoint() {
  var str = fs.readFileSync(FILE, "utf8");
  return {
    time: Date.now(),
    energy: parseInt(str),
  };
}

var lastPoint = getEnergyPoint();
setInterval(function() {
  var point = getEnergyPoint();
  var energyDelta = (point.energy - lastPoint.energy) / 1e6;
  var timeDelta = (point.time - lastPoint.time) / 1e3;
  point.power = energyDelta / timeDelta;

  io.emit("power", point);
  lastPoint = point;
}, samplingTime);


// Notify clients when they connect

io.on("connection", function(socket) {
  socket.emit("header", {
    samplingTime: samplingTime
  });
})
