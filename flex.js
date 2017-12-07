var mcpadc = require('mcp-spi-adc');
var rpio = require('rpio');
var firebase = require('firebase');


var Middle = 0;
var Index = 0;
var Thumb = 0;
var gesture = "none";
var canDetect = true;
var detectTime = 0;
var detectCooldown = 5000;
var doingCooldown = false;

var person = 1;

var middle = mcpadc.open(4, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var index = mcpadc.open(3, {speedHz: 20000}, function (err) {
  if (err) throw err;
});
var thumb = mcpadc.open(5, {speedHz: 20000}, function (err) {
  if (err) throw err;
});

function setup(){
  console.log("Starting firebase setup");
  let config = {
    apiKey: "AIzaSyADmzdnO0lNOONCJ2nL9SPN2JB9OtJb8Y0",
    authDomain: "multimodal-2f37a.firebaseapp.com",
    databaseURL: "https://multimodal-2f37a.firebaseio.com",
    projectId: "multimodal-2f37a",
    storageBucket: "multimodal-2f37a.appspot.com",
    messagingSenderId: "23867613841"
  };
  firebase.initializeApp(config);
}

function sendGesture(gesture){
  ref = firebase.database().ref(person+"/gesture");
  let obj = {gesture: gesture, time: new Date().getTime()};
  ref.set(obj);
}


setup();

var loop = setInterval(function(){
  sensorLoop();
},1000);

function sensorLoop(){
  readFromSensors();

  if(!doingCooldown){
    detectGestures();
  }else{
    if(Date.now() > detectTime + detectCooldown){
      doingCooldown = false;
    }
  }
 
}


function readFromSensors(){
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
}

function detectGestures(){
  if(Thumb > 0.27 && Index < 0.21 && Middle < 0.19 && canDetect){
    canDetect = false;
    gesture = "start";
    sendGesture(gesture);
  }
  else if(Thumb > 0.27 && Index > 0.27 && Middle < 0.19 && canDetect){
    canDetect = false;
    gesture = "vol_up";
    sendGesture(gesture);
  }
  else if(Thumb < 0.27 && Index > 0.29 && Middle < 0.19 && canDetect){
    canDetect = false;
    gesture = "vol_down";
    sendGesture(gesture);
  }
  else if(Thumb > 0.29 && Index > 0.32 && Middle > 0.36 && canDetect){
    canDetect = false;
    gesture = "stop";
    sendGesture(gesture);
  }
  else{
    gesture = "none";
    canDetect = true;
    doingCooldown = true;
    detectTime = Date.now();
  }
  
    console.log(gesture);
}




