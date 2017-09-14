var http = require('http');
var fs = require('fs');
var five = require("johnny-five");
//var board = new five.Board(); //use this if the one below doesn't work
var board = new five.Board({port:"COM1"}); //for com specifics (Windows)
var admin = require("firebase-admin");
//Control Variables
var timeUnit = parseInt(process.argv[2])*1000; //default this to 5 (seconds), etc. run: node app.js 5
var timeBarrier = timeUnit * 2;
var signals = [];
var lastSignalTime = Date.now() - (7 * timeUnit);
var timeSince;
var isSensorOn = true;
var motionStartTime = 0;
var motionInProgress = false;
var motionSequence = "";
var messagesRef;
var lastLetters = "";

//Letter array
var morseCodeTableArray = [{
	letter:'A',
	code: ['0','1']
},{
	letter:'B',
	code: ['1','0','0','0']
},{
	letter:'C',
	code: ['1','0','1','0']
},{
	letter:'D',
	code: ['1','0','0']
},{
	letter:'E',
	code: ['0']
},{
	letter:'F',
	code: ['0','0','1','0']
},{
	letter:'G',
	code: ['1','1','0']
},{
	letter:'H',
	code: ['0','0','0','0']
},{
	letter:'I',
	code: ['0','0']
},{
	letter:'J',
	code: ['0','1','1','1']
},{
	letter:'K',
	code: ['1','0','1']
},{
	letter:'L',
	code: ['0','1','0','0']
},{
	letter:'M',
	code: ['1','1']
},{
	letter:'N',
	code: ['1', '0']
},{
	letter:'O',
	code: ['1','1','1']
},{
	letter:'P',
	code: ['0','1','1','0']
},{
	letter:'Q',
	code: ['0','1','1','0']
},{
	letter:'R',
	code: ['0','1','0']
},{ 
	letter:'S',
	code: ['0','0','0']
},{ 
	letter:'T',
	code: ['1']
},{ 
	letter:'U',
	code: ['0','0','1']
},{ 
	letter:'V',
	code: ['0','0','0','1']
},{ 
	letter:'W',
	code: ['0','1','1']
},{ 
	letter:'X',
	code: ['1','0','0','1']
},{ 
	letter:'Y',
	code: ['1','0','1','1']
},{ 
	letter:'Z',
	code: ['1','1','0','0']
},{ 
	letter:'0',
	code: ['1','1','1','1','1']
},{ 
	letter:'1',
	code: ['0','1','1','1','1']
},{ 
	letter:'2',
	code: ['0','0','1','1','1']
},{ 
	letter:'3',
	code: ['0','0','0','1','1']
},{ 
	letter:'4',
	code: ['0','0','0','0','1']
},{ 
	letter:'5',
	code: ['0','0','0','0','0']
},{ 
	letter:'6',
	code: ['1','0','0','0','0']
},{ 
	letter:'7',
	code: ['1','1','0','0','0']
},{ 
	letter:'8',
	code: ['1','1','1','0','0']
},{ 
	letter:'9',
	code: ['1','1','1','1','0']
},{
	letter:'.',
	code: ['0', '1', '0', '1', '0', '1']
},{
	letter:',',
	code: ['1', '1', '0', '0', '1', '1']
},{
	letter:'?',
	code: ['0', '0', '1', '1', '0', '0']
},{
	letter:"'",
	code: ['0', '1', '1', '1', '1', '0']
},{
	letter:'!',
	code: ['1', '0', '1', '0', '1', '1']
},{
	letter:'/',
	code: ['1', '0', '0', '1', '0']
},{
	letter:'(',
	code: ['1', '0', '1', '1', '0']
},{
	letter:')',
	code: ['1', '0', '1', '1', '0', '1']
},{
	letter:'&',
	code: ['0', '1', '0', '0', '0']
},{
	letter:':',
	code: ['1', '1', '1', '0', '0', '0']
},{
	letter:';',
	code: ['1', '0', '1', '0', '1', '0']
},{
	letter:'=',
	code: ['1', '0', '0', '0', '1']
},{
	letter:'+',
	code: ['0', '1', '0', '1', '0']
},{
	letter:'-',
	code: ['1', '0', '0', '0', '0', '1']
},{
	letter:'_',
	code: ['0', '0', '1', '1', '0', '1']
},{
	letter:'"',
	code: ['0', '1', '0', '0', '1', '0']
},{
	letter:'$',
	code: ['0', '0', '0', '1', '0', '0', '1']
},{
	letter:'@',
	code: ['0', '1', '1', '0', '1', '0']
}];

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://fit3140assignment2.firebaseio.com/"  // IMPORTANT: repalce the url with yours 
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/motionSensorData"); // channel name
ref.on("value", function(snapshot)
{   //this callback will be invoked with each new object
	//console.log(snapshot.val());         // How to retrive the new added object
}, function (errorObject)
{             // if error
	console.log("The read failed: " + errorObject.code);
});

//Setup the motion detection functions when the board is connected
board.on("ready", function()
{
	var motion = new five.Motion(2);
	//Inform console when board is ready to take inputs and output
	motion.on("calibrated", function(){
		console.log('Motion detector calibrated! Now recording motions.');
	});
	//Start tracking a new motion, increment the number of motions
	motion.on("motionstart", function()
	{
		//console.log('Motion detected');
		//Note the motion is in progress regardless of sensor on/off state incase it is turned on
		motionInProgress = true;
		//Actually record numbers if it is on
		if (isSensorOn)
		{
			timeSince = Date.now() - lastSignalTime;
			if ((timeSince > 7 * timeUnit) && (signals.length > 0))
			{
				//new word
				saveAndCheck("message", checkCharacter(signals));
				saveAndCheck("message", ' ');
				signals = [];
			}
			else if ((timeSince > 3 * timeUnit) && signals.length > 0)
			{
				//new character
				saveAndCheck("message", checkCharacter(signals));
				signals = [];
			}
			saveMessage("motionSignal", "High");
			motionStartTime = Date.now();
		}
	});
	motion.on("motionend", function()
	{
		//debug line to see duration of each motion
		//console.log('Motion finished, duration: ' + (Date.now() - motionStartTime));
		//Check the motion was recorded as starting
		if(isSensorOn && motionInProgress)
		{
			saveMessage("motionSignal", "Low");
			if((Date.now() - motionStartTime) > timeBarrier)
			{
				saveMessage('motionSensorData', 'Long');
				signals.push('1');
			}
			else
			{
				saveMessage('motionSensorData', 'Short');
				signals.push('0');
			}
			//Reset the timer
			motionStartTime = 0;
			lastSignalTime = Date.now()
		}
		//End the existing motion, regardless of whether the motion detecting is on or off, incase it is turned on.
		motionInProgress = false;
	});
});

//create the server to send the page
var server = http.createServer(function(req, res){
	var filePath = req.url;
	if (filePath == '/') filePath = '/index.html'
	filePath = __dirname + filePath;
	console.log(filePath+' was requested');
	var ext = filePath.split('.').pop();
	var contentType = '';
	//Make sure the correct type is sent for the correct extension
	switch (ext){
		case '.html':
			contentType = 'text/html';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.js':
			contentType = 'text/javascript';
			break;
	}
	//Send the file
	fs.exists(filePath, function(exists){
		if (exists)
		{
			fs.readFile(filePath, function(error, content)
			{
				if (error)
				{
					res.writeHead(500);
					res.end();
				}
				else
				{
					res.writeHead(200,{'Content-Type':contentType});
					res.end(content, 'utf-8');
				}
			});
		}
	});
});

//Begin listening for clients
server.listen(3000, function(){
	console.log('listening on *:3000');
	loadMessages();
});

//Begin tracking motions when the sensor is toggled on
function sensor_on()
{
	isSensorOn = true
	//Add a new motion if the sensor was already detecting somone upon the sensor being toggled on
	if(motionInProgress){
		motionStartTime = Date.now();
	}
	return
}

//Stop tracking motions when the sensor is toggled off
function sensor_off()
{
	isSensorOn = false
	//If a motion is in progress, end it now and log the result based on the duration
	if(motionStartTime > 0 && motionInProgress)
	{
		if((Date.now() - motionStartTime) > timeBarrier)
		{
			saveMessage('motionSensorData', 'Long');
			signals.push('1');
		}
		else
		{
			saveMessage('motionSensorData', 'Short');
			signals.push('0');
		}
	}
	return
}

//checks to see if SK (end of transmission)
function SKCheck()
{
	//truncate first letter if too long
	if (lastLetters.length > 3)
	{
		lastLetters = lastLetters.substring(1);
	}
	//check if last few letters are SK(space)
	if (lastLetters == "SK ")
	{
		sensor_off();
		lastLetters = "";
	}
}

//Listen to requests
 function loadMessages()
 {
	messagesRef = db.ref('clientRequest');
	messagesRef.off();
	var getRequests = function (data)
	{
		var val = data.val();
		if(val.type == 'motion')
		{
			if(val.action == 'on')
			{
				sensor_on();
			}
			else
			{
				sensor_off();
			}
		}
	}.bind(this);
	messagesRef.limitToLast(1).on('child_added', getRequests);
	messagesRef.limitToLast(1).on('child_changed', getRequests);
 };

// Saves character to firebase and then check to see if SK has been reached
function saveAndCheck(reference, typeName)
{
	lastLetters += typeName;
	saveMessage(reference, typeName);
	SKCheck();
}


// Saves messages to firebase
function saveMessage(reference, typeName)
{
	// Add a new message entry to the Firebase Database.
	messagesRef = db.ref(reference);
	messagesRef.off();
	messagesRef.push
	({
		id: 1,
		time: Date.now(),
		type: typeName
	}).then(function ()
	{
		console.log(typeName)
	}.bind(this)).catch(function (error)
	{
		console.error('Error writing new message to Firebase Database', error);
	});
};


//Use to compare individual characters
function checkCharacter(morseArray)
{
	var match;
	for(var i = 0; i < morseCodeTableArray.length; i++)
	{
		if(morseArray.length == morseCodeTableArray[i].code.length){
			match = true;
			for(var j = 0; j < morseArray.length; j++){
				if(morseArray[j] != morseCodeTableArray[i].code[j]){
					match = false;
					j = morseArray.length;
				}
			}
			if(match) return morseCodeTableArray[i].letter;
		}
	}
	return ''; 
}