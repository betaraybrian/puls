	'use strict';


var mcpadc = require('mcp-spi-adc');

var pulseSensor = mcpadc.open(6, {speedHz: 20000}, function (err) {
  if (err) throw err;

var rate = [750,750,750,750,750,750,750,750,750,750];

var sampleCounter = 0;
var lastBeatTime = 0;
var P = 512;
var T = 512;

var amp = 100;
var firstBeat = true;
var secondBeat = false;
var thresh = 550;
var max = 530;
var min = 500;

var IBI = 780;
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

if(Signal < min){
min = Signal;
}
if(Signal > max){
max = Signal;
}

currentTime = new Date().getTime();

sampleCounter += currentTime - lastTime;
lastTime = currentTime;

N = sampleCounter - lastBeatTime;

if(Pulse == false && Signal > thresh && N > 325 && N < 1200 && N > (IBI /2)){

	Pulse = true;
	IBI = sampleCounter - lastBeatTime;
	lastBeatTime = sampleCounter;


	rate.splice(0,1);
	rate.push(IBI);
	runningTotal = rate.reduce(add, 0);
	runningTotal /= rate.length;
	BPM = 60000/runningTotal;
      console.log("bpm "+ BPM + "  IBI = "+ IBI + "   signal  "+Signal+ "   thresh  "+thresh);

}

if(Signal < thresh && Pulse == true){
	Pulse = false;
}

if(N > 1200 && N < 1300){
min = 100000;
max = 0;
console.log(Signal);
}

if(N > 5000){
thresh = (((min/2)+max)/3)*2;
console.log(Signal);
lastBeatTime = sampleCounter;
}

tal ++;
//console.log(Signal);
/*if(tal > 2000){

      console.log("bpm "+ BPM + "  IBI = "+ IBI + "   signal  "+Signal+ "   max  "+max+ "   min  "+min);
	tal = 0;
}
*/

    });
  }, 5);
});
