# Assignment 5 Iteration 2 - Team 55

## Usage
To use the server:
  - Connect the board to the machine
  - Run app.js through Node to boot the server (The server will run and interact with the firebase from here)
  - Perform motions in front of the sensor to generate data to be read as morsecode
  - Performing the motion for "SK" will end the transmission
  
To use the client:
  - Use firebase serve to give the client a connection point  
  - Connect on the port provided by the firebase using your browser
  - The client will obtain the state of the firebase automatically from here reading old data, then listening for future data
  - Server can be reset by pressing "Reset", which will turn the LED and Motion detector off, as well as resetting the count deleting all exisitng data on the firebase.
  - The server can stopped by toggling the "Toggle Transmission" switch.
  
## Structure
##### Client
- The majority of the client's functionality can be seen in firebaseWebApi.js, which is based off Assignment 2
- On loading, the script checks the setup and connects to firebase, given that succeeds it then loads all previous messages from the firebase.
- Motions are read and updated from the firebase
- Firebase can be reset with the Reset button
- If transmission is toggled a message is sent to the Server via the firebase to stop/start transmission.

##### Firebase
- The firebase has messages split into four categories: Messages, Signals, motion data, and client requests.
- Populated by server, except client requests populated by the client
- Cleared by client

##### Server
- The server's functionality is located in app.js
- Upon loading, the server calibrates the motion sensor
- Motions are parsed into signals, and then letters, with each type being uploaded as it gets parsed
- Supports Punctuation, Numbers and Letters
- Supports being terminated by either message from client via firebase or "SK" being signalled.

##### Board
- Motion sensor connected to pin 2
