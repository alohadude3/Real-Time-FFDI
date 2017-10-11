window.onload = function()
{

};

function validateInput(event)
{
	var theEvent = event || window.event;
	var key = theEvent.keyCode || theEvent.which;
	key = String.fromCharCode(key);
	var regex = /[0-9]|\./;
	if (!regex.test(key) )
	{
		theEvent.returnValue = false;
		if (theEvent.preventDefault) 
		{
			theEvent.preventDefault();
		}
	}
}

function validationCheck()
{
	var errors = false;
	var temp = document.getElementById("temp").value;
	var rh = document.getElementById("rh").value;
	var vel = document.getElementById("vel").value;
	var dslr = document.getElementById("dslr").value;
	var lr = document.getElementById("lr").value;
	var bkdi = document.getElementById("bkdi").value;
	if (emptyCheck(temp, "tempError"))
	{
		errors = true;
	}
	else if (intCheck(temp, "tempError"))
	{
		errors = true;
	}
	else if (rangeCheckWithoutUpper(temp, "tempError", 0))
	{
		errors = true;
	}
	if (emptyCheck(rh, "rhError"))
	{
		errors = true;
	}
	else if (intCheck(rh, "rhError"))
	{
		errors = true;
	}
	else if (rangeCheck(rh, "rhError", 0, 100))
	{
		errors = true;
	}
	if (emptyCheck(vel, "velError"))
	{
		errors = true;
	}
	else if (intCheck(vel, "velError"))
	{
		errors = true;
	}
	else if (rangeCheckWithoutUpper(vel, "velError", 0))
	{
		errors = true;
	}
	if (emptyCheck(dslr, "dslrError"))
	{
		errors = true;
	}
	else if (intCheck(dslr, "dslrError"))
	{
		errors = true;
	}
	else if (rangeCheckWithoutUpper(dslr, "dslrError", 0))
	{
		errors = true;
	}
	if (emptyCheck(lr, "lrError"))
	{
		errors = true;
	}
	else if (intCheck(lr, "lrError"))
	{
		errors = true;
	}
	else if (rangeCheckWithoutUpper(lr, "lrError", 0))
	{
		errors = true;
	}
	if (intCheck(bkdi, "bkdiError"))
	{
		errors = true;
	}
	else if (rangeCheck(bkdi, "bkdiError", 0, 200))
	{
		errors = true;
	}
	if (!errors)
	{
		calculateIndex();
	}
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

function intCheck(input, errorField)
{
	if (isNaN(input))
	{
		document.getElementById(errorField).textContent = "Must be a number";
		document.getElementById(errorField).style.color = "red";
		return true;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return false;
	}
}

function rangeCheck(input, errorField, lower, upper)
{
	if (input < lower || input > upper)
	{
		document.getElementById(errorField).textContent = "Must be between " + lower + " and " + upper + " (inclusive)";
		document.getElementById(errorField).style.color = "red";
		return true;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return false;
	}
}

function rangeCheckWithoutUpper(input, errorField, lower)
{
	if (input < lower)
	{
		document.getElementById(errorField).textContent = "Must be " + lower + " or above";
		document.getElementById(errorField).style.color = "red";
		return true;
	}
	else
	{
		document.getElementById(errorField).textContent = "";
		return false;
	}
}

function calculateIndex()
{
	var temp = parseFloat(document.getElementById("temp").value);
	var rh = parseFloat(document.getElementById("rh").value);
	var vel = parseFloat(document.getElementById("vel").value);
	var dslr = parseFloat(document.getElementById("dslr").value);
	var lr = parseFloat(document.getElementById("lr").value);
	var bkdi = parseFloat(document.getElementById("bkdi").value);
	if (document.getElementById("bkdi").value == "")
	{
		var df = ((0.191 * (200 + 104) * Math.pow(dslr + 1, 1.5)) / (3.52 * Math.pow(dslr + 1, 1.5) + lr - 1));
		var ffdi = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		var df = ((0.191 * (0 + 104) * Math.pow(dslr + 1, 1.5)) / (3.52 * Math.pow(dslr + 1, 1.5) + lr - 1));
		var ffdiMin = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		showAlert("Your FFDI ranges from " + ffdiMin + " to " + ffdi + " depending on your BKDI.", ffdi);
	}
	else
	{
		var df = ((0.191 * (bkdi + 104) * Math.pow(dslr + 1, 1.5)) / (3.52 * Math.pow(dslr + 1, 1.5) + lr - 1));
		var ffdi = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		showAlert("Your FFDI is " + ffdi, ffdi);
	}
}

function showAlert(message, ffdi)
{
	var type;
	var severity;
	if (ffdi <= 11)
	{
		type = "success";
		severity = "Low-Moderate";
	}
	else if (ffdi <= 24)
	{
		type = "info";
		severity = "High";
	}
	else if (ffdi <= 49)
	{
		type = "warning";
		severity = "Very High"
	}
	else if (ffdi <= 74)
	{
		type = "danger";
		severity = "Severe"
	}
	else if (ffdi <= 99)
	{
		type = "danger";
		severity = "Extreme";
	}
	else
	{
		type = "danger";
		severity = "Catastrophic (Code Red)";
	}
	$("#alert").html("<div class='alert alert-" + type + "'>"
	+ "Severity: " + severity + "<br>" + message
	+ "</div>");
	$("#alert").show();
}