	'use strict';

var mcpadc = require('mcp-spi-adc');

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
var currentTime = 0;
var tal = 0;
var runningTotal = 0;
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
 
if(Signal < thresh && N > (IBI/5.0)*3){
	if(Signal < T){
		T = Signal;
	}
}

if(Signal > thresh && Signal > P){
	P = Signal;
}

if(N > 325){
	if(Signal > thresh && Pulse == false && N > (IBI/5.0)*3){
		Pulse = true;
		IBI = sampleCounter - lastBeatTime;
		lastBeatTime = sampleCounter;


		
		if(secondBeat){
			secondBeat = false;
			for(let i = 0; i < rate.length; i++){
				rate[i] = IBI;
			}
		}
		if(firstBeat){
			firstBeat = false;
			secondBeat = true;
			
		}
		

		rate.splice(0,1);
		rate.push(IBI);
		runningTotal = rate.reduce(add, 0);

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

tal ++;
console.log(Signal);
if(tal > 160){
console.log("reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      //console.log("bpm "+ BPM + "  IBI = "+ IBI );
	tal = 0;
}


    });
  }, 5);
});