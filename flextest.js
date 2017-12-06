var mcpadc = require('mcp-spi-adc');
var rpio = require('rpio');

var pin = 12;           /* P12/GPIO18 */
var range = 1024;       /* LEDs can quickly hit max brightness, so only use */
var max = 1000;          /*   the bottom 8th of a larger scale */
var clockdiv = 8;       /* Clock divider (PWM refresh rate), 8 == 2.4MHz */
var interval = 2;       /* setInterval timer, speed of pulses */
var times = 1;          /* How many times to pulse before exiting */

var Middle = 0;
var Index = 0;
var Thumb = 0;
var gesture = "none";

var middle = mcpadc.open(1, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var index = mcpadc.open(2, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var thumb = mcpadc.open(3, {speedHz: 20000}, function (err) {
  if (err) throw err;
});


var play = setInterval(function () {
    middle.read(function (err, reading) {
      if (err) throw err;
	Middle = reading.value;
      console.log("middle   " + Middle );
    });

	index.read(function (err, reading) {
      if (err) throw err;
	Index = reading.value;
      console.log("index   " + Index);
    });

	thumb.read(function (err, reading) {
      if (err) throw err;
	Thumb = reading.value
      console.log("thumb   " +	Thumb );
    });

if(Thumb > 0.27 && Index < 0.21 && Middle < 0.19){gesture = "okay";}
else if(Thumb > 0.27 && Index > 0.27 && Middle < 0.19){gesture = "fingerbang";}
else if(Thumb < 0.27 && Index > 0.29 && Middle < 0.19){gesture = "pointing";}
else if(Thumb > 0.29 && Index > 0.32 && Middle > 0.36){gesture = "halt";}
else{gesture = "none";}

	console.log(gesture);
	if(gesture == "okay"){
play1();
else{
	rpio.pwmSetData(pin, 0);
}
}

  }, 1000);



/*
 * Sleep
 */
function sleep(milliseconds){
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++){
		if((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}



function play1(){
/*
 * Enable PWM on the chosen pin and set the clock and range.
 */

rpio.open(pin, rpio.PWM);
rpio.pwmSetClockDivider(clockdiv);
rpio.pwmSetRange(pin, range);

/*
 * Repeatedly pulse from low to high and back again until times runs out.
 */
var direction = 1;
var data = 0;
var pulse = setInterval(function() {
        rpio.pwmSetData(pin, data);
        if (data > max ) {
                if (times-- === 0) {
			rpio.pwmSetData(pin, 0);
                        clearInterval(pulse);
                        rpio.open(pin, rpio.INPUT);
                        return;
                }
	direction = 1;
	data = 0;
	rpio.pwmSetData(pin, data);
        sleep(100);
	}
        data += direction;
	if(data > (max/2)){
	direction = 3;
	}
}, interval, data, direction, times);
}