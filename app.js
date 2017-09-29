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
	res.sendFile(__dirname + "/client/index.html");
});

app.post("/ffdi", function(req, res)
{
	var user = new Object();
	user.host = "ftp.bom.gov.au";
	user.longitude = req.body.longitude;
	user.latitude = req.body.latitude;
	var client = new ftp();
	//On connecting with BOM via ftp client
	client.on("ready", function()
	{
		var dbLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/stations_db.txt";
		var dataLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/";
		//tmp.setGracefulCleanup();
		let getDataLocation = function()
		{
			return new Promise(function(resolve, reject)
			{
				client.get(dbLocation, function(err, stream)
				{
					//download stations_db.txt
					if (err)
					{
						reject(err);
					}
					var readableStream;
					var data = "";
					stream.on("data", function(chunk)
					{
						data += chunk;
					});
					stream.on("end", function()
					{
						//parse through the stations
						data = data.toLowerCase();
						data = data.split("\n");
						for (var i = 0; i < data.length; i++)
						{
							data[i] = data[i].replace(new RegExp(/([a-z]|\(|\))\ ([a-z]|\(|\))/g), "$1_$2"); //replacing all the (spaces) in (char)(space)(char) with _
							data[i] = data[i].replace(new RegExp(/\ \/\ /g), "___"); //replace (space)/(space) with ___
							data[i] = data[i].replace(new RegExp(/_aws/g), ""); //removing all the _aws
							data[i] = data[i].replace(new RegExp(/(\ )+/g), " "); //replaces all multiple spaces into 1 single space
							data[i] = data[i].split(" ");
						}
						//find the nearest weather station
						var closestIndex = 0;
						var closestDistance = Math.sqrt(Math.pow(data[0][5] - user.longitude, 2) + Math.pow(data[0][6] - user.latitude, 2));
						for (var index = 1; index < data.length; index++)
						{
							var newDistance = Math.sqrt(Math.pow(data[index][5] - user.longitude, 2) + Math.pow(data[index][6] - user.latitude, 2));
							if (newDistance < closestDistance)
							{
								closestDistance = newDistance;
								closestIndex = index;
							}
						}
						//update the directory name name
						dataLocation = dataLocation.concat(data[closestIndex][1].concat("/")); //state directory
						dataLocation = dataLocation.concat(data[closestIndex][3].concat("/")); //station directory
						dataLocation = dataLocation.concat(data[closestIndex][3].concat("-").concat((new Date()).getFullYear())); //year
						dataLocation = dataLocation.concat(("0" + ((new Date()).getMonth() + 1)).slice(-2)); //month
						dataLocation = dataLocation.concat(".csv"); //file extension
						resolve();
					});
				});
			});
		}
		let getClimateData = function()
		{
			return new Promise(function(resolve, reject)
			{
				client.get(dataLocation, function(err, stream)
				{
					//download climate data file
					if (err)
					{
						reject(err);
					}
					var data = "";
					stream.on("data", function(chunk)
					{
						data += chunk;
					})
					stream.on("end", function()
					{
						//parse the data file path and add relevant data to variables
						data = data.split("\n");
						data.splice(0, data.length - 2);
						data.splice(data.length - 1, 1);
						console.log(data);
					});
					//Cleanup
					stream.once("close", function()
					{
						client.end();
						resolve();
					});
				});
			});
		}
		getDataLocation().then(function()
		{
			return getClimateData();
		});
	});
	client.connect(user);
	res.sendFile(__dirname + "/client/ffdi.html");
});

//Local host
app.listen(8080, function()
{
	console.log("Listening at port 8080");
});