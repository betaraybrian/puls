var mcpadc = require('mcp-spi-adc');
var rpio = require('rpio');


var Middle = 0;
var Index = 0;
var Thumb = 0;
var gesture = "none";

var middle = mcpadc.open(4, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var index = mcpadc.open(3, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var thumb = mcpadc.open(5, {speedHz: 20000}, function (err) {
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


  }, 1000);


