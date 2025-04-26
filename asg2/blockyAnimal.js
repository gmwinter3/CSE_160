// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variales
let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;
let u_Modelmatrix;
let u_GlobalRotateMatrix;

// setupWebGL()
function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('cnv1');
  
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
}

// connectVariablesToGLSL()
function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const LINE_STRIP = 3;

// Globals related to UI elements
let g_selectedColor=[0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_circleSegments = 10;
let currentLine = null;

// joint controls
let g_armAngle = 205;
let g_magentaAngle = 0;

let g_bodyAngle = 0;
let g_headAngle = 0;
// animation  
let g_animation = false;
let g_swayAngle = 0;
let g_footLift = 0;
// rotation control with mouse
let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_cameraAngleX = 0;
let g_cameraAngleY = 135;
// shift click animation
let g_shakeAnimation = false;
let g_shakeStartTime = 0;
let g_currentLeanAngle = 0;
let g_targetLeanAngle = 0;
let g_shakeAngle = 0;




// Set up actions for the HTML UI elements
// addActionsForHtmlUI()
function addActionsForHtmlUI() {

    //Button Events
    document.getElementById('animationOn').onclick = function() {g_animation = true;};
    document.getElementById('animationOff').onclick = function() {g_animation = false;};

    // Circle Segment Slider Evetns
    document.getElementById("armSlider").addEventListener('mousemove',   function() { g_armAngle = this.value; renderAllShapes(); });
    document.getElementById("headSlider").addEventListener('mousemove',   function() { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById("bodySlider").addEventListener('mousemove',   function() { g_bodyAngle = this.value; renderAllShapes(); });

}

// main()
function main() {
    addActionsForHtmlUI();
    setupWebGL();
    connectVariablesToGLSL();
    
    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    // canvas.onmousemove = click;
    //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    // Reset line on mouse up
    canvas.onmouseup = function() {
        currentLine = null;  // Reset the currentLine when mouse is released
    };

    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            g_shakeAnimation = true;
            g_shakeStartTime = performance.now() / 1000.0;
            g_targetLeanAngle = -20; // start leaning forward
        } else {
            g_mouseDown = true;
            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;
        }
    };
    
    canvas.onmousemove = function(ev) {
        if (!g_mouseDown) return;
    
        let dx = ev.clientX - g_lastMouseX;
        let dy = ev.clientY - g_lastMouseY;
    
        g_cameraAngleY -= dx * 0.5;  // horizontal drag affects Y-rotation
        g_cameraAngleX -= dy * 0.5;  // vertical drag affects X-rotation
    
        g_cameraAngleX = Math.max(Math.min(g_cameraAngleX, 90), -90); // clamp for vertical
    
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    
        renderAllShapes(); // re-render with updated camera
    };
    
    canvas.onmouseup = function() {
        g_mouseDown = false;
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 1.0, 1.0);    
    // Clear <canvas>
//    gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_animation) {
        g_swayAngle = Math.sin(g_seconds * 2) * 5; // only sway when animating
        g_armAngle = 205 + Math.sin(g_seconds * 2) * 10; // Sway arms slightly
        g_footLift = Math.sin(g_seconds * 2) * 5; // degrees to rotate feet
      }

    if (g_shakeAnimation) {
        let elapsed = g_seconds - g_shakeStartTime;

        // Smoothly interpolate lean angle (natural easing)
        g_currentLeanAngle += (g_targetLeanAngle - g_currentLeanAngle) * 0.1;

        // Add side-to-side shake while leaning
        if (elapsed < 1.0) {
            g_shakeAngle = Math.sin(elapsed * 40) * 5; // fast side shake
        } else {
            g_targetLeanAngle = 0; // start leaning back
            g_shakeAngle = 0;

            // End animation when lean returns to 0
            if (Math.abs(g_currentLeanAngle) < 0.5) {
                g_currentLeanAngle = 0;
                g_shakeAnimation = false;
            }
        }
    } else {
        // In case animation is off, reset lean
        g_currentLeanAngle += (0 - g_currentLeanAngle) * 0.1;
        g_shakeAngle = 0;
    }
}


var g_shapesList = [];

// Draw every shape that is supposed to be in the canvas
// renderAllShapes()
function renderAllShapes() {

    var startTime = performance.now();


    // Pass the matrix to u_ModelMatrix attribute
    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_cameraAngleX, 1, 0, 0);  // vertical tilt
    globalRotMat.rotate(g_cameraAngleY, 0, 1, 0);  // horizontal pan
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let g_penguinScale = 2.0;
    let baseMatrix = new Matrix4();
    baseMatrix.scale(g_penguinScale, g_penguinScale, g_penguinScale);   
    baseMatrix.translate(0, 0.2, 0);   
    baseMatrix.rotate(g_swayAngle, 0, 0, 1); // apply sway
    baseMatrix.rotate(-g_currentLeanAngle, 1, 0, 0); // smooth forward lean
    baseMatrix.rotate(g_shakeAngle, 0, 1, 0);       // fast side-to-side shake
    baseMatrix.rotate(g_bodyAngle, 0, 0, 1); // rotate entire body

    let headMatrix = new Matrix4(baseMatrix);
    headMatrix.rotate(g_headAngle, 0, 0, 1);
    

    // === BODY ===
    var body = new Cube();
    body.color = [0.4, 0.4, 8.0, 1.0]; // black
    body.matrix = new Matrix4(baseMatrix); 
    body.matrix.translate(-0.1, -0.35, -0.01);
    body.matrix.scale(0.2, 0.35, 0.18);
    body.render();
    
    // === BELLY ===
    var belly = new Cube();
    belly.color = [0, 0, 0, 0]; // white
    belly.matrix = new Matrix4(baseMatrix); 
    belly.matrix.translate(-0.07, -0.31, 0.11);
    belly.matrix.scale(0.14, 0.25, 0.07);
    belly.render();
    
    // === HEAD ===
    var head = new Cube();
    head.color = [0.0, 0.0, 0.0, 1.0]; // black
    head.matrix = new Matrix4(headMatrix); 
    head.matrix.translate(-0.08, 0.0, 0.0);
    head.matrix.scale(0.16, 0.16, 0.16);
    head.render();
    
    // === BEAK ===
    var beak = new Cube();
    beak.color = [1.0, 0.5, 0.0, 1.0]; // orange
    beak.matrix = new Matrix4(headMatrix); 
    beak.matrix.translate(-0.038, 0.05, 0.16);
    beak.matrix.scale(0.07, 0.04, 0.05);
    beak.render();
    
    // === EYES WHITE ===
    var eyeLeft = new Sphere(20);  // 20 segments for smoothness
    eyeLeft.color = [1.0, 1.0, 1.0, 1.0]; // white
    eyeLeft.matrix = new Matrix4(headMatrix); 
    eyeLeft.matrix.translate(-0.045, 0.111, 0.155);
    eyeLeft.matrix.scale(0.025, 0.025, 0.025);
    eyeLeft.render();
    
    var eyeRight = new Sphere(20);
    eyeRight.color = [1.0, 1.0, 1.0, 1.0]; // white
    eyeRight.matrix = new Matrix4(headMatrix); 
    eyeRight.matrix.translate(0.035, 0.114, 0.155);
    eyeRight.matrix.scale(0.025, 0.025, 0.025);
    eyeRight.render();
    
    // === PUPILS ===
    var pupilLeft = new Cube();
    pupilLeft.color = [0.0, 0.0, 0.0, 1.0]; // black
    pupilLeft.matrix = new Matrix4(headMatrix); 
    pupilLeft.matrix.translate(-0.049, 0.105, 0.16);
    pupilLeft.matrix.scale(0.01, 0.01, 0.01);
    pupilLeft.render();
    
    var pupilRight = new Cube();
    pupilRight.color = [0.0, 0.0, 0.0, 1.0]; // black
    pupilRight.matrix = new Matrix4(headMatrix); 
    pupilRight.matrix.translate(0.03, 0.107, 0.16);
    pupilRight.matrix.scale(0.01, 0.01, 0.01);
    pupilRight.render();
    
    // === FLIPPERS ===
    var leftFlipper = new Cube();
    leftFlipper.color = [0.0, 0.0, 0.0, 1.0]; // black
    leftFlipper.matrix = new Matrix4(baseMatrix); 
    leftFlipper.matrix.translate(-0.05, -0.06, 0.03);
    leftFlipper.matrix.rotate(-g_armAngle, 0, 0, 1);
    leftFlipper.matrix.scale(0.035, 0.25, 0.1);
    leftFlipper.render();
    
    var rightFlipper = new Cube();
    rightFlipper.color = [0.0, 0.0, 0.0, 1.0]; // black
    rightFlipper.matrix = new Matrix4(baseMatrix); 
    rightFlipper.matrix.translate(0.08, -0.038, 0.03);
    rightFlipper.matrix.rotate(g_armAngle, 0, 0, 1);
    rightFlipper.matrix.scale(0.035, 0.25, 0.1);
    rightFlipper.render();
    
    // === FEET ===
    var leftFoot = new Cube();
    leftFoot.color = [1.0, 0.5, 0.0, 1.0]; // orange
    leftFoot.matrix = new Matrix4(baseMatrix); 
    leftFoot.matrix.translate(-0.1, -0.38, 0.05);
    leftFoot.matrix.rotate(g_footLift, 1, 0, 0); // animate foot lift
    leftFoot.matrix.scale(0.07, 0.03, 0.16);
    leftFoot.render();
    
    var rightFoot = new Cube();
    rightFoot.color = [1.0, 0.5, 0.0, 1.0]; // orange
    rightFoot.matrix = new Matrix4(baseMatrix); 
    rightFoot.matrix.translate(0.03, -0.38, 0.05);
    rightFoot.matrix.rotate(-g_footLift, 1, 0, 0); // animate foot lift

    rightFoot.matrix.scale(0.07, 0.03, 0.16);
    rightFoot.render();

    // Chceck the time at the end of the function andc show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/100, "numdot");
}

// click()
function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    if (g_selectedType === LINE_STRIP) {
        if (!currentLine) {
            currentLine = new LineStrip();  // Create a new line when drawing starts
            currentLine.color = g_selectedColor.slice();
            g_shapesList.push(currentLine);
        }
        currentLine.addPoint(x, y);
        renderAllShapes();
    } else {
        let shape;
        if (g_selectedType == POINT) {
            shape = new Point();
        } else if (g_selectedType == TRIANGLE) {
            shape = new Triangle();
        } else {
            shape = new Circle();
        }

        shape.position = [x, y];
        shape.color = g_selectedColor.slice();
        shape.size = g_selectedSize;
        g_shapesList.push(shape);
        renderAllShapes();
    }
}

// Extract the event click and return it to WebGL coordinates
// convertCoordinatesEventToGL()
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}