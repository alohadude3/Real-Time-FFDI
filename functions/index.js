const functions = require('firebase-functions');
const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const ftp = require("ftp");
const parser = require("body-parser");

app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/client"));

app.get("/", function(req, res)
{
	res.sendFile("index.html");
});

app.post("/ffdi", function(req, res)
{
	var user = new Object();
	user.host = "ftp.bom.gov.au";
	user.longitude = req.body.longitude;
	user.latitude = req.body.latitude;
	res.send(user);
	var tmp = require("tmp");
	tmp.setGracefulCleanup();
	//Temp files for storing downloaded files
	var databaseFile = tmp.fileSync({dir: "./"});
	var dataFile = tmp.fileSync({dir: "./"});
	console.log(databaseFile.name);
	console.log(dataFile.name);
	var client = new ftp();
	client.connect(user);
	//On connecting with BOM via ftp client
	client.on("ready", function()
	{
		console.log("Connected to bom.");
		client.get("./anon/gen/clim_data/IDCKWCDEA0/tables/stations_db.txt", function(err, stream)
		{
			if (err)
			{
				throw err;
			}
			stream.pipe(fs.createWriteStream(databaseFile.name));
			//Cleanup the temp files
			databaseFile.removeCallback();
			dataFile.removeCallback();
			client.end();
		});
	});
});

exports.app = functions.https.onRequest(app);