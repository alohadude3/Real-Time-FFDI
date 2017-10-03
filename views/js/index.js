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
	var errors = 0;
	var longD = document.getElementById("longD").value;
	var longM = document.getElementById("longM").value;
	var longS = document.getElementById("longS").value;
	var latD = document.getElementById("latD").value;
	var latM = document.getElementById("latM").value;
	var latS = document.getElementById("latS").value;
	/** Empty check */
	errors += emptyCheck(longD, "longDError");
	errors += emptyCheck(longM, "longMError");
	errors += emptyCheck(longS, "longSError");
	errors += emptyCheck(latD, "latDError");
	errors += emptyCheck(latM, "latMError");
	errors += emptyCheck(latS, "latSError");
	/** Range check for minutes and seconds */
	errors += rangeCheck(longM, "longMError");
	errors += rangeCheck(longS, "longSError");
	errors += rangeCheck(latM, "latMError");
	errors += rangeCheck(latS, "latSError");
	if (errors == 0)
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
			alert("Coordinates must be within Australia.\nNorth bound: 10 degrees.\nSouth bound: -44 degrees.\nEast bound: 154 degrees.\nWest bound: 113 degrees.");
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

function isInt(value)
{
	return !isNaN(value) && parseInt(value) == value && !isNaN(parseInt(value, 10));
}

function emptyCheck(input, errorField)
{
	if (input == null || input == "")
	{
		document.getElementById(errorField).textContent = "Cannot be empty";
		document.getElementById(errorField).style.color = "red";
		return 1;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return 0;
	}
}

function rangeCheck(input, errorField)
{
	if (input != null && input != "")
	{
		if (input < 0 || input >= 60)
		{
			document.getElementById(errorField).textContent = "Must be between 0 and 59 (inclusive)";
			document.getElementById(errorField).style.color = "red";
			return 1;
		}
		else
		{
			document.getElementById(errorField).textContent = "";
			return 0;
		}
	}
}