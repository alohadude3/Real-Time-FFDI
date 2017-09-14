var database;
var storage;
var messagesRef;

//Start loading everything
window.onload = function() {
  checkSetup();
  initFirebase();
  loadMessages();
};

// Checks that the Firebase SDK has been correctly setup and configured, default code from provided firebaseWebAPI
function checkSetup() {
	if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
	  window.alert('You have not configured and imported the Firebase SDK. ' +
		'Make sure you go through the codelab setup instructions.');
	} else if (config.storageBucket === '') {
	  window.alert('Your Firebase Storage bucket has not been enabled.');
	}
	document.getElementById('status').innerText = 'Connected';
};
  
//Initialise the values for firebase
function initFirebase() {
	database = firebase.database();
	storage = firebase.storage();
};


//Fetch old data, and setup functions to collect new data
function loadMessages() {
	// Reference to the motion sensors database path.
	messagesRef = database.ref('motionSignal');
	// Make sure we remove all previous listeners.
	messagesRef.off();
	// Loads the last 250 messages and listen for new ones.
	var updateMotions = function (data) {
		var val = data.val();
		$('#sig').replaceWith($('<ul id="sig"></ul><ul class="trash">Signal: '+val.type+'</ul>'));
	}.bind(this);
	//Read all motion entries
	messagesRef.on('child_added', updateMotions);
	messagesRef.on('child_changed', updateMotions);
	
	//And letters
	messagesRef = database.ref('motionSensorData');
	// Make sure we remove all previous listeners.
	messagesRef.off();
	// Loads the last 250 messages and listen for new ones.
	var updateMotions = function (data) {
		var val = data.val();
		$('#mor').replaceWith($('<ul id="mor"></ul><ul class="trash">Morse: '+val.type+'</ul>'));
	}.bind(this);
	//Read all motion entries
	messagesRef.on('child_added', updateMotions);
	messagesRef.on('child_changed', updateMotions);
	
	//And letters
	messagesRef = database.ref('message');
	// Make sure we remove all previous listeners.
	messagesRef.off();
	// Loads the last 250 messages and listen for new ones.
	var updateMotions = function (data) {
		var val = data.val();
		$('#let').replaceWith($('<ul id="let">'+ $('#let').text() + val.type+'</ul>'));
	}.bind(this);
	//Read all motion entries
	messagesRef.on('child_added', updateMotions);
	messagesRef.on('child_changed', updateMotions);
};

  function saveMessage(reference, actionName, typeName) {
    // Add a new message entry to the Firebase Database.
	messagesRef = database.ref(reference);
	messagesRef.off();
    messagesRef.push({
      action: actionName,
      time: Date.now(),
      type: typeName
    }).then(function () {
      console.log('Done')
    }.bind(this)).catch(function (error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  };

//Handle toggle switch
function motionfunc()
{
	if($('#motioncheck').prop("checked")){
		saveMessage('clientRequest','on','motion');
	}
	else{
		saveMessage('clientRequest','off','motion');
	}
}

//Handle button
function resetfunc()
{
	//Remove existing data
	database.ref('message').remove();
	database.ref('motionSensorData').remove();
	database.ref('motionSignal').remove();
	database.ref('clientRequest').remove();
	$('#sig').replaceWith($('<ul id="sig">No Motion Signals</ul>'));
	$('#mor').replaceWith($('<ul id="mor">No Morse Messages</ul>'));
	$('#let').replaceWith($('<ul id="let">Message: </ul>'));
	$('.trash').remove();
}