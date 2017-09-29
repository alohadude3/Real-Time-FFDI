const functions = require('firebase-functions');
const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const ftp = require("ftp");
const fs = require("fs");
const parser = require("body-parser");
const promise = require("promise");

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
	var tmp = require("tmp");
	tmp.setGracefulCleanup();
	var client = new ftp();
	//On connecting with BOM via ftp client
	client.on("ready", function()
	{
		var dbLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/stations_db.txt";
		var dataLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/stations_db.txt";
		//Temp files for storing downloaded files
		var databaseFile = tmp.fileSync({dir: "./"});
		var dataFile = tmp.fileSync({dir: "./"});
		let getDataLocation = new Promise(function(resolve, reject)
		{
			client.get(dbLocation, function(err, stream)
			{
				if (err)
				{
					reject(err);
				}
				stream.pipe(fs.createWriteStream(__dirname + "/" + databaseFile.name));
				stream.on("finish", function()
				{
					//parse the file and update the data file path
				});
			});
			resolve();
		});
		let getClimateData = new Promise(function(resolve, reject)
		{
			client.get(dataLocation, function(err, stream)
			{
				if (err)
				{
					reject(err);
				}
				//stream.pipe(fs.createWriteStream(__dirname + "/" + dataFile.name));
				stream.on("finish", function()
				{
					//parse the data file path and add relevant data to variables
				});
				//Cleanup
				stream.once("close", function()
				{
					databaseFile.removeCallback();
					dataFile.removeCallback();
					client.end();
				});
			});
			resolve();
		});
		getDataLocation.then(getClimateData);
	});
	client.connect(user);
});

//Cloud functions
exports.app = functions.https.onRequest(app);

//Local host
app.listen(8080, function()
{
	console.log("Listening at port 8080");
});