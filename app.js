let firebase = require("firebase");
let Player = require('player');

let VOLUME_DOWN = "vol_down", VOLUME_UP = "vol_up", START = "start", STOP = "stop";

let soundFiles =
["pulse80.mp3",
"pulse90.mp3",
"pulse100.mp3",
"pulse110.mp3",
"pulse120.mp3",
"pulse130.mp3",
"pulse140.mp3",
"pulse150.mp3",
"pulse160.mp3",
"pulse170.mp3",
"pulse180.mp3",
"pulse190.mp3",
"pulse200.mp3",];

let soundQueue = [];

// Set this to either 1 or 2
let person = 1;

// The person's current pulse
let pulse = 120;
let otherPulse = 90;

// How often we send the pulse to the other person.
// In milliseconds
let pulseSendDelay = 3000;

let player;

// Start up firebase
function setupFirebase(){
  let config = {
    apiKey: "AIzaSyADmzdnO0lNOONCJ2nL9SPN2JB9OtJb8Y0",
    authDomain: "multimodal-2f37a.firebaseapp.com",
    databaseURL: "https://multimodal-2f37a.firebaseio.com",
    projectId: "multimodal-2f37a",
    storageBucket: "multimodal-2f37a.appspot.com",
    messagingSenderId: "23867613841"
  };
  firebase.initializeApp(config);
  setupFirebaseListeners();
}

// Setup listeners for database values
function setupFirebaseListeners(){
  let otherPerson = (person === 1)? 2: 1;
  let ref = firebase.database().ref(otherPerson+"/gesture");

  ref.on('value', function(snapshot){
    if(snapshot.val()){
      onGestureReceived(snapshot.val().gesture);
    }
  });

  ref = firebase.database().ref(otherPerson+"/pulse");

  ref.on('value', function(snapshot){
    if(snapshot.val()){
      onPulseValueReceived(snapshot.val().pulse);
    }
  });

  sendGesture(START);

  setInterval(function(){
    sendPulseValue(pulse);
    addNewSong();
  }, pulseSendDelay);

  startPlaying();
}

// Called whenever a gesture perfomed by the other person has been received.
function onGestureReceived(gestureString){

  if(gestureString === VOLUME_DOWN || gestureString === VOLUME_UP){
    // Either volume up or down was recieved from the other person
    // We don't care about this
    return;
  }

  if(gestureString === START){
    // Start gesture was received.
    // Play tacton
    console.log("start received");
   playStartTacton();

  }
  if(gestureString === STOP){
    // Stop gesture was received.
    // Play tacton
  // stopTacton.play();
    console.log("stop received");
  }
}

// Sends a gesture to the other person
function sendGesture(gesture){
  ref = firebase.database().ref(person+"/gesture");
  let obj = {gesture: gesture, time: new Date().getTime()};
  ref.set(obj);
}

module.exports.sendStart = function(){
  sendGesture(START);
}

module.exports.sendStop = function(){
  sendGesture(STOP);
}

// Sends the pulse value to the other person
function sendPulseValue(pulseValue){
  ref = firebase.database().ref(person+"/pulse");
  let obj = {pulse: pulseValue, time: new Date().getTime()};
  ref.set(obj);
}


module.exports.setPulse = function(pulse){
  savePulseValue(pulse);
}


// USE THIS FUNCTION TO SAVE PULSE VALUE TROELS
// TROELS TROELS TROELS TROELS TROELS
function savePulseValue(newPulseValue){
  pulse = newPulseValue;
  console.log("It works Troels!");
}

// Called when a new pulse value has been received
function onPulseValueReceived(pulseValue){
  console.log("Pulse value received: "+pulseValue);
  otherPulse = pulseValue;
  
}

function addNewSong(){
  let soundClip = getSoundFileFromPulseData(otherPulse);
  addSongToQueue(soundClip);
}

function getSoundFileFromPulseData(pulseValue){

  let index = map(pulseValue, 80, 200, 0, soundFiles.length-1);
  return soundFiles[index];

}

function addSongToQueue(songFile){
  player.add("Music/"+songFile);
}

function map(i, cMin, cMax, dMin, dMax){

  let cVal = cMax - cMin;
  let val = i - cMin;
  val = val / cVal;
  let dVal = dMax - dMin;
  val = val * dVal;

  return Math.round( val + dMin );

}


function startPlaying(){
  player = new Player();
  onPulseValueReceived(90);
  onPulseValueReceived(100);
  onPulseValueReceived(180);

  console.log(player.list);

  player.play();


}
setupFirebase();
