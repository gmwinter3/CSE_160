// asg0.js
function main() {
	// Retrieve <canvas> element=
	canvas = document.getElementById('cnv1');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return false;
	}
	
	// Get the rendering context for 2DCG
	ctx = canvas.getContext('2d');
	
	// Draw a black rectangle
	ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
	ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

function handleDrawEvent() {
    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	let v1x = parseFloat(document.getElementById("v1x").value);
	let v1y = parseFloat(document.getElementById("v1y").value);
	console.log(v1x);
	console.log(v1y);

	let v1 = new Vector3([v1x, v1y, 0]);

	drawVector(v1, "red");

	let v2x = parseFloat(document.getElementById("v2x").value);
	let v2y = parseFloat(document.getElementById("v2y").value);
	console.log(v2x);
	console.log(v2y);

	let v2 = new Vector3([v2x, v2y, 0]);

	drawVector(v2, "blue");
}

function drawVector(v, color) {
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    
    // Scale vector by 20 for better visualization
    let scaledX = v.elements[0] * 20;
    let scaledY = v.elements[1] * 20;


    // Draw the vector
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + scaledX, cy - scaledY); // Invert Y to match canvas coordinate system
    ctx.stroke();
}

function handleDrawOperationEvent() {
    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1x = parseFloat(document.getElementById("v1x").value);
    let v1y = parseFloat(document.getElementById("v1y").value);
    let v2x = parseFloat(document.getElementById("v2x").value);
    let v2y = parseFloat(document.getElementById("v2y").value);
    let scalar = parseFloat(document.getElementById("scalar").value);
    let operation = document.getElementById("operation").value;

	let v1 = new Vector3([v1x, v1y, 0]);
	let v2 = new Vector3([v2x, v2y, 0]);

	drawVector(v1, "red");
	drawVector(v2, "blue");

    if (operation === "add") {
        let v3 = new Vector3([v1x, v1y, 0]);
        v3.add(v2);
        drawVector(v3, "green");
    } else if (operation === "sub") {
        let v3 = new Vector3([v1x, v1y, 0]);
        v3.sub(v2);
        drawVector(v3, "green");
    } else if (operation === "mult") {
        let v3 = new Vector3([v1x, v1y, 0]).mul(scalar);
        let v4 = new Vector3([v2x, v2y, 0]).mul(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "div") {
        let v3 = new Vector3([v1x, v1y, 0]).div(scalar);
        let v4 = new Vector3([v2x, v2y, 0]).div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "mag") {
        console.log("Magnitude of v1:", v1.magnitude());
        console.log("Magnitude of v2:", v2.magnitude());
    } else if (operation === "norm") {
        let normV1 = new Vector3([v1x, v1y, 0]).normalize();
        let normV2 = new Vector3([v2x, v2y, 0]).normalize();
        drawVector(normV1, "green");
        drawVector(normV2, "green");
	} else if (operation === "angle") {
        let angle = angleBetween(v1, v2);
        console.log("Angle:", angle);
    } else if (operation === "area") {
        let area = areaTriangle(v1, v2);
        console.log("Area of the triangle:", area);
    }
}

function angleBetween(v1, v2) {
    let dotProduct = Vector3.dot(v1, v2);
    let magV1 = v1.magnitude();
    let magV2 = v2.magnitude();
    let cosAlpha = dotProduct / (magV1 * magV2);
    let angle = Math.acos(cosAlpha);  // in radians
    return angle * (180 / Math.PI);   // Convert to degrees
}

function areaTriangle(v1, v2) {
    let crossProd = Vector3.cross(v1, v2);
    let area = crossProd.magnitude() / 2;
    return area;
}