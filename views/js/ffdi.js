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
		var ffdiMax = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		var df = ((0.191 * (0 + 104) * Math.pow(dslr + 1, 1.5)) / (3.52 * Math.pow(dslr + 1, 1.5) + lr - 1));
		var ffdiMin = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		alert("Your FFDI ranges from " + ffdiMin + " to " + ffdiMax + " depending on your BKDI.");
	}
	else
	{
		var df = ((0.191 * (bkdi + 104) * Math.pow(dslr + 1, 1.5)) / (3.52 * Math.pow(dslr + 1, 1.5) + lr - 1));
		var ffdi = 2 * Math.exp(-0.45 + 0.987 * Math.log(df) - 0.0345 * rh + 0.0338 * temp + 0.0234 * vel);
		alert("Your FFDI is " + ffdi);
	}
}