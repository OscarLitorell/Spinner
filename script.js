
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


function init() {
	oldAngle = 0;
	pressed = false;
	mouseX = 0;
	mouseY = 0;
	DPC = 0;
	lastRotation = 0;
	middleX = 0;
	middleY = 0;
	setInterval(main, 10);
	
};


function readTouchPos(event) {
	deadzone = Math.min(height, width) * 0.144 * 0.85;
	
	var touches = [];
	for (var i = 0; i < event.touches.length; i++) {
		var coords = [event.touches[i].clientX, event.touches[i].clientY];
		var distance = Math.sqrt((coords[0] - middleX) ** 2 + (coords[1] - middleY) ** 2)
		if (distance > deadzone) {
			touches.push(coords);
		};
	};
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


function mouseDown() {
	pressed = true;
	lastRotation = rotation();
	dAngle = mouseAngle() - lastRotation;
};


function rotation() {
	// Credit for this function goes to Chris Coyier:
	// https://css-tricks.com/get-value-of-css-rotation-through-javascript/
	tr = window.getComputedStyle(document.getElementById("spinner")).getPropertyValue("transform");
	var values = tr.split('(')[1];
    values = values.split(')')[0];
    values = values.split(',');
	var a = values[0];
	var b = values[1];
	return Math.round(Math.atan2(b, a) * (180/Math.PI));
};


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


function mouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
};

function touchMove(event) {
	var pos = readTouchPos(event);
	
	if (pos !== false) {
		mouseX = pos[0];
		mouseY = pos[1];
	};
};

function mouseRelease() {
	pressed = false;
};


function main() {
	width = window.getComputedStyle(document.getElementById("touchScreen")).getPropertyValue("width");
	width = width.slice(0, width.length - 2);
	
	height = window.getComputedStyle(document.getElementById("touchScreen")).getPropertyValue("height");
	height = height.slice(0, height.length - 2);
	
	
	middleY = Math.round(height / 2);
	middleX = Math.round(width / 2);

	
	
	
	if (pressed) {
		var newAngle = mouseAngle() - dAngle;
		DPC = rotation() - oldAngle;
	} else {
		newAngle = rotation() + DPC;
		DPC *= 0.998;
		if (Math.abs(DPC) < 0.1 && DPC != 0) {
			DPC = 0;
		};
	};
	
	oldAngle = rotation();
	document.getElementById("spinner").style.transform = "rotate(" + newAngle + "deg)";
};


