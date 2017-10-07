const functions = require('firebase-functions');
const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const ftp = require("ftp");
const fs = require("fs");
const parser = require("body-parser");
const promise = require("promise");
const events = require("events");

app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/views")
app.set("view engine", "ejs");
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/views"));

app.get("/", function(req, res)
{
	console.log("User connected.");
	res.render("index");
});

app.post("/ffdi", function(req, res)
{
	console.log("User requested for (" + req.body.longitude + ", " + req.body.latitude + ")");
	var user = new Object();
	var month;
	var lastDate;
	user.host = "ftp.bom.gov.au";
	user.longitude = req.body.longitude;
	user.latitude = req.body.latitude;
	user.dslr = 0;
	user.lr = 0;
	var eventdslr = new events.EventEmitter();
	var client = new ftp();
	//On connecting with BOM via ftp client
	client.on("ready", function()
	{
		var dbLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/stations_db.txt";
		var dataLocation = "./anon/gen/clim_data/IDCKWCDEA0/tables/";

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
					else
					{
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
							//get the coordinates
							user.stationLong = data[closestIndex][5];
							user.stationLat = data[closestIndex][6];
							//update the directory name name
							dataLocation = dataLocation.concat(data[closestIndex][1].concat("/")); //state directory
							dataLocation = dataLocation.concat(data[closestIndex][3].concat("/")); //station directory
							dataLocation = dataLocation.concat(data[closestIndex][3].concat("-").concat((new Date()).getFullYear())); //year
							dataLocation = dataLocation.concat(("0" + ((new Date()).getMonth() + 1)).slice(-2)); //month
							dataLocation = dataLocation.concat(".csv"); //file extension
							resolve();
						});
					}
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
					else
					{
						var data = "";
						stream.on("data", function(chunk)
						{
							data += chunk;
						});
						stream.on("end", function()
						{
							//parse the data file path and add relevant data to variables
							data = data.split("\n");
							data.splice(0, 13);
							for (var i = 0; i < data.length; i++)
							{
								data[i] = data[i].split(",");
							}
							user.station = data[data.length - 2][0]
							user.date = data[data.length - 2][1]
							user.temp = data[data.length - 2][5];
							user.rh = data[data.length - 2][7];
							user.vel = data[data.length - 2][9] * 3.6;
							//if it hasn't rained today, then defaults to 1 day since last rain and add from there
							if (data[data.length - 2][3] == 0)
							{
								user.dslr = 1;
							}
						});
						stream.once("close", function()
						{
							resolve();
						});
					}
				});
			});
		}
		
		let checkForRain = function()
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
					else
					{
						var data = "";
						stream.on("data", function(chunk)
						{
							data += chunk;
						});
						stream.on("end", function()
						{
							//parse the data file path and add relevant data to variables
							data = data.split("\n");
							data.splice(0, 13);
							data.splice(-1, 1);
							for (var i = 0; i < data.length; i++)
							{
								data[i] = data[i].split(",");
							}
							for (var i = data.length - 1; i >= 0; i--)
							{
								if (data[i][3] == 0)
								{
									if (data[i][1] != lastDate)
									{
										user.dslr += 1;
										lastDate = data[i][1];
									}
								}
								else
								{
									user.lr = data[i][3];
									break;
								}
							}
							if (user.lr != 0)
							{
								client.end();
							}
							else
							{
								if (month > 1)
								{
									month--;
									//get the month before
									dataLocation = dataLocation.substring(0, dataLocation.length - 6);
									dataLocation = dataLocation.concat(("0" + month).slice(-2)); //month
									dataLocation = dataLocation.concat(".csv"); //file extension
								}
								else
								{
									month = 12;
									//get the year before
									dataLocation = dataLocation.substring(0, dataLocation.length - 10);
									dataLocation = dataLocation.concat((new Date()).getFullYear()); //year
									dataLocation = dataLocation.concat("12.csv"); //file extension
								}
							}
							resolve();
						});
					}
				});
			});
		}

		eventdslr.on("get", function()
		{
			checkForRain().then(function()
			{
				if (user.lr == 0)
				{
					eventdslr.emit("get");
				}
				else
				{
					eventdslr.emit("finish");
				}
			}).catch(function(err)
			{
				console.log(err);
			});
		});

		eventdslr.on("finish", function()
		{
			console.log(user);
			res.render("ffdi", {user: user});
		});

		getDataLocation().then(function()
		{
			return getClimateData();
		}).catch(function()
		{
			//get the month before current if current month file does not exist
			dataLocation = dataLocation.substring(0, dataLocation.length - 6);
			dataLocation = dataLocation.concat(("0" + ((new Date()).getMonth())).slice(-2)); //month
			dataLocation = dataLocation.concat(".csv"); //file extension
			return getClimateData();
		}).then(function()
		{
			month = parseInt(dataLocation.substring(dataLocation.length - 6, dataLocation.length - 4));
			lastDate = user.date;
			eventdslr.emit("get");
		}).catch(function(err)
		{
			console.log(err);
		});
	});
	client.connect(user);
});

//Local host
app.listen(8080, function()
{
	console.log("Listening at port 8080");
});