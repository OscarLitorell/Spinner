
/*
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



// This functions runs once the page loads.
// It declares all varables, and calls the main loop 100 times per second.
function init() {
	oldAngle = 0;
	pressed = false;
	mouseX = 0;
	mouseY = 0;
	DPC = 0;
	lastDPC = 0;
	lastRotation = 0;
	middleX = 0;
	middleY = 0;
	hue = Math.round(Math.random() * 360);
	
		
	setInterval(main, 1000/60);
};


// This function reads all the points where the user touches the screen, and returns the average of the points that aren't
// on the stationary part of the spinner.
function readTouchPos(event) {
	deadzone = Math.min(height, width) * 0.144 * 0.85;	//This declares the radius of the stationary part of the spinner.
	
	
	// This section pushes all touching points, except for the ones within the radius we calculated earlier from the middle of the screen,
	// to an array called 'touches'.
	var touches = [];
	for (var i = 0; i < event.touches.length; i++) {
		var coords = [event.touches[i].clientX, event.touches[i].clientY];
		var distance = Math.sqrt(Math.pow((coords[0] - middleX), 2) + Math.pow((coords[1] - middleY), 2));
		if (distance > deadzone) {
			touches.push(coords);
		};
	};
	
	// This section calculates the average coordinates of the touching points and returns the value,
	// and if there are no touching points (or the only point is on the stationary part of the spinner)
	// it returns a false value.
	var totalX = 0;
	var totalY = 0;
	for (var i = 0; i < touches.length; i++) {
		totalX += touches[i][0];
		totalY += touches[i][1];
	};
	totalX /= touches.length;
	totalY /= touches.length;
	if (! isNaN(totalY)) {
		return [totalX, totalY];
	} else {
		return false;
	};
};


// This function runs each time the user touches the screen at a new coordinate.
function touchDown(event) {
	var pos = readTouchPos(event);
	
	if (pos !== false) {
		mouseX = pos[0];
		mouseY = pos[1];
		mouseDown();
	} else {
		pressed = false;
	};
};

// This function runs each time the user presses a mouse button down.
function mouseDown() {
	pressed = true;
	lastRotation = rotation();
	dAngle = mouseAngle() - lastRotation;
};



// This function reads the angle that the spinner is rotated to at the moment.
// Credit for this function goes to Chris Coyier:
// https://css-tricks.com/get-value-of-css-rotation-through-javascript/
function rotation() {
	tr = window.getComputedStyle(document.getElementById("spinner")).getPropertyValue("transform");
	var values = tr.split('(')[1];
    values = values.split(')')[0];
    values = values.split(',');
	var a = values[0];
	var b = values[1];
	return Math.round(Math.atan2(b, a) * (180/Math.PI));
};


// This function calculates the angle between where the cursor is and the middle of the screen. 
function mouseAngle() {
	dX = mouseX - middleX;
	dY = 0 - (mouseY - middleY);
	angle = Math.atan(dX/dY);
	angle = angle * 180 / Math.PI;
	
	
	if (dY < 0) {
		angle += 180;
	};
	
	angle +=360;
	
	angle = angle % 360;
	
	return angle;
};

// This function runs each time the user moves the mouse.
function mouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
};

// This function runs each time the user moves a point of touch.
function touchMove(event) {
	var pos = readTouchPos(event);
	
	if (pos !== false) {
		mouseX = pos[0];
		mouseY = pos[1];
	};
};

// This function runs each time the user releases a mouse button.
function mouseRelease() {
	pressed = false;
};

// This function is the main loop of the program.
function main() {
	// Window width
	width = window.getComputedStyle(document.getElementById("touchScreen")).getPropertyValue("width");
	width = width.slice(0, width.length - 2);
	
	// Window height
	height = window.getComputedStyle(document.getElementById("touchScreen")).getPropertyValue("height");
	height = height.slice(0, height.length - 2);
	
	// Middle of the window
	middleY = Math.round(height / 2);
	middleX = Math.round(width / 2);
	
	var spinnerRadius = window.getComputedStyle(document.getElementById("spinner")).getPropertyValue("width");
	
	spinnerRadius = spinnerRadius.slice(0, spinnerRadius.length - 2) * 0.5;
	
	
	document.getElementById("spinner").style.top = (middleY - spinnerRadius) + "px";
	document.getElementById("spinner").style.left = (middleX - spinnerRadius) + "px";
	document.getElementById("blurSpinner").style.top = (middleY - spinnerRadius) + "px";
	document.getElementById("blurSpinner").style.left = (middleX - spinnerRadius) + "px";
	document.getElementById("topSpinner").style.top = (middleY - spinnerRadius) + "px";
	document.getElementById("topSpinner").style.left = (middleX - spinnerRadius) + "px";

	
	
	if (pressed) {
		// Rotates the spinner accordingly when the user is controlling it.
		var newAngle = mouseAngle() - dAngle;
		DPC = rotation() - oldAngle;
		lastDPC = DPC * 0.5 + lastDPC * 0.5;
	} else {
		// Lets the spinner coast down if the user releases it.
		DPC = lastDPC;
		newAngle = rotation() + DPC;
		DPC *= 0.996;
		if (Math.abs(DPC) < 0.1 && DPC != 0) {
			DPC = 0;
		};
		lastDPC = DPC;
	};
	
	console.log(DPC + " " + lastDPC);
	
	oldAngle = rotation();
	document.getElementById("spinner").style.transform = "rotate(" + newAngle + "deg)";
	
	
	// Changes the background colour after how the spinner has spun.
	cornerAngle = 360 - Math.atan(width / height) / Math.PI * 180;
	hue = (hue + DPC * 0.03) % 360;
	document.getElementById("container").style.background ="linear-gradient(" + cornerAngle + "deg, hsl(" + (hue + 40) + ", 70%, 50%), hsl(" + hue + ", 70%, 60%), hsl(" + (hue - 40) + ", 70%, 70%))";
	
	
	// Makes the spinner look blurry at high speed.
	var speed = (Math.abs(DPC) - 7) / 10;
	
	speed = Math.max(0, speed);
	speed = Math.min(1, speed);	
	
	document.getElementById("spinner").style.opacity = 1 - speed * 0.9;
	document.getElementById("blurSpinner").style.opacity = speed;
	
};


