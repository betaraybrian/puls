	'use strict';

var mcpadc = require(mcp-spi-adc);

var pulseSensor = mcpadc.open(0, {speedHz: 20000}, function (err) {
  if (err) throw err;

var rate = [0,0,0,0,0,0,0,0,0,0];
var sampleCounter = 0;
var lastBeatTime = 0;
var P = 512;
var T = 512;
var thresh = 525;
var amp = 100;
var firstBeat = true;
var secondBeat = false;

var IBI = 600;
var Pulse = false;
var lastTime = new Date().getTime();

var BPM = 0;
var Signal = 0;
var N = 0;

function add(a,b){
	return a+b;
}


setInterval(function () {
	pulseSensor.read(function (err, reading) {
    	if (err) throw err;


Signal = reading.value * 1024;
currentTime = new Date().getTime();

sampleCounter += currentTime - lastTime;
lastTime = currentTime;

N = sampleCounter - lastBeatTime;
 
if(Signal < thresh && N > (IBI/5)*3){
	if(Signal < T){
		T = Signal;
	}
}

if(Signal > thresh && Signal > P){
	P = Signal;
}

if(N > 250){
	if(Signal > thresh && Pulse == false && N > (IBI/5)*3){
		Pulse = true;
		IBI = sampleCounter - lastBeatTime;
		lastBeatTime = sampleCounter;

		if(secondBeat){
			secondBeat = false;
			for(i = 0; i < rate.length; i++){
				rate[i] = IBI;
			}
		}

		if(firstBeat){
			firstBeat = false;
			secondBeat = true;
		}

		var pop = rate.pop();
		rate.unshift(IBI)
		var runningTotal = rate.reduce(add, 0);

		runningTotal /= rate.length;
		BPM = 60000/runningTotal;
	}
}

if(Signal < thresh && Pulse == true){
	Pulse = false;
	amp = P-T;
	thresh = amp/2 + T;
	P = thresh;
	T = thresh;
}

if(N > 2500){
	thresh = 512;
	P = 512;
	T = 512;
	lastBeatTime = sampleCounter;
	firstBeat = true;
	secondBeat = false;
	BPM = 0;
}

      console.log((reading.value * 3.3 - 0.5) * 100);
    });
  }, 1000);
});