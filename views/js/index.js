window.onload = function()
{
	document.getElementById("longD").value = 0;
	document.getElementById("longM").value = 0;
	document.getElementById("longS").value = 0;
	document.getElementById("latD").value = 0;
	document.getElementById("latM").value = 0;
	document.getElementById("latS").value = 0;
};

function validateLongLat(event)
{
	var theEvent = event || window.event;
	var key = theEvent.keyCode || theEvent.which;
	key = String.fromCharCode(key);
	var regex = /[0-9]/;
	if (!regex.test(key) )
	{
		theEvent.returnValue = false;
		if (theEvent.preventDefault) 
		{
			theEvent.preventDefault();
		}
	}
}

function validateForm()
{
	var errors = false;
	var longD = document.getElementById("longD").value;
	var longM = document.getElementById("longM").value;
	var longS = document.getElementById("longS").value;
	var latD = document.getElementById("latD").value;
	var latM = document.getElementById("latM").value;
	var latS = document.getElementById("latS").value;
	/** Empty check */
	if (emptyCheck(longD, "longDError"))
	{
		errors = true;
	}
	if (emptyCheck(longM, "longMError"))
	{
		errors = true;
	}
	else if (rangeCheck(longM, "longMError"))
	{
		errors = true;
	}
	if (emptyCheck(longS, "longSError"))
	{
		errors = true;
	}
	else if (rangeCheck(longS, "longSError"))
	{
		errors = true;
	}
	if (emptyCheck(latD, "latDError"))
	{
		errors = true;
	}
	if (emptyCheck(latM, "latMError"))
	{
		errors = true;
	}
	else if (rangeCheck(latM, "latMError"))
	{
		errors = true;
	}
	if (emptyCheck(latS, "latSError"))
	{
		errors = true;
	}
	else if (rangeCheck(latS, "latSError"))
	{
		errors = true;
	}
	if (!errors)
	{
		var longitude = parseFloat(longD);
		longitude += parseFloat(longM / 60) + parseFloat(longS / 3600);
		if (document.getElementById("radioSouth").checked)
		{
			longitude *= -1;
		}
		var latitude = parseFloat(latD);
		latitude += parseFloat(latM / 60) + parseFloat(latS / 3600);
		if (document.getElementById("radioWest").checked)
		{
			latitude *= -1;
		}
		if (longitude <= -44 || longitude >= -10 || latitude >= 154|| latitude <= 113)
		{
			showAlert();
			return false;
		}
		else
		{
			document.getElementById("longitude").value = longitude;
			document.getElementById("latitude").value = latitude;
			return true;
		}
	}
	else
	{
		return false;
	}
}

function isInt(input)
{
	return !isNaN(input) && parseInt(input) == input && !isNaN(parseInt(input, 10));
}

function emptyCheck(input, errorField)
{
	if (input == null || input == "")
	{
		document.getElementById(errorField).textContent = "Cannot be empty";
		document.getElementById(errorField).style.color = "red";
		return true;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return false;
	}
}

function rangeCheck(input, errorField)
{
	if (input < 0 || input >= 60)
	{
		document.getElementById(errorField).textContent = "Must be between 0 and 59 (inclusive)";
		document.getElementById(errorField).style.color = "red";
		return true;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return false;
	}
}

function showAlert()
{
	$("#alert").html("<div class='alert alert-danger alert-dismissable'>"
	+ "<a href='#' class='close' data-dismiss='alert' aria-label='close'>x</a>"
	+ "Coordinates must be within Australia.<br>Longitude: 10 degrees south, 44 degrees south.<br>Latitude: 154 degrees east, 113 degrees east."
	+ "</div>");
	$("#alert").show();
}