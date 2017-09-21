var http = require('http');
var fs = require('fs');
var admin = require("firebase-admin");

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
server.listen(3000, function()
{
	console.log('listening on *:3000');
});