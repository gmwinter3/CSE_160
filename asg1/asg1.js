// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const LINE_STRIP = 3;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_circleSegments = 10;
let currentLine = null;

// Set up actions for the HTML UI elements
// addActionsForHtmlUI()
function addActionsForHtmlUI() {

    //Button Events
    document.getElementById('clearCanvas').onclick = function() {g_shapesList = []; currentLine = null; renderAllShapes();};
    document.getElementById('undo').onclick = function() {g_shapesList.pop(); renderAllShapes();};
    document.getElementById("drawImage").addEventListener("click", drawImage);

    document.getElementById('squareButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('triangleButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

    document.getElementById('lineButton').onclick = function() { g_selectedType = LINE_STRIP };

    // Color Slider Events
    document.getElementById("redSlider").addEventListener('mouseup',    function() { g_selectedColor[0] = this.value/100; });
    document.getElementById("greenSlider").addEventListener('mouseup',  function() { g_selectedColor[1] = this.value/100; });
    document.getElementById("blueSlider").addEventListener('mouseup',   function() { g_selectedColor[2] = this.value/100; });

    // Size Slider Evetns
    document.getElementById("sizeSlider").addEventListener('mouseup',   function() { g_selectedSize = this.value; });

    // Circle Segment Slider Evetns
    document.getElementById("circleSegmentSlider").addEventListener('mouseup',   function() { g_circleSegments = this.value; });

}

// main()
function main() {
    addActionsForHtmlUI();
    setupWebGL();
    connectVariablesToGLSL();
    
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    // canvas.onmousemove = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    // Reset line on mouse up
    canvas.onmouseup = function() {
        currentLine = null;  // Reset the currentLine when mouse is released
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

// click()
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

// Draw every shape that is supposed to be in the canvas
// renderAllShapes()
function renderAllShapes() {

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}

function drawImage() {
    // Clear canvas
    g_shapesList = [];

    // Define triangles using sets of 3 vertices
    let triangles = [
        // head
        {vertices: [[0, 5], [1, 4], [-1, 4]], color: [0.6, 0.933, 0.6, 1.0] },
        { vertices: [[0, 2], [1, 4], [-1, 4]], color: [0.6, 0.933, 0.6, 1.0] }, 
        // left arm
        { vertices: [[-2, 2], [-1, 2], [-2, 3.5]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[-2, 2], [-2, 3.5], [-4, 3.5]], color: [0.561, 0.737, 0.561, 1.0] }, 
        { vertices: [[-2, 2], [-4, 2], [-4, 3.5]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[-4, 2], [-4, 3.5], [-4.5, 3]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[-5, 1], [-4.5, 3], [-4, 2]], color: [0.561, 0.737, 0.561, 1.0] },
        // right arm
        { vertices: [[2, 2], [1, 2], [2, 3.5]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[2, 2], [2, 3.5], [4, 3.5]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[2, 2], [4, 2], [4, 3.5]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[4, 2], [4, 3.5], [4.5, 3]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[5, 1], [4.5, 3], [4, 2]], color: [0.561, 0.737, 0.561, 1.0] },
        // body
        { vertices: [[0, 3.5], [-2, 2], [2, 2]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[-2, 2], [2, 2], [0, 0]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[0, 0], [-3, 0], [-2, 2]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[0, 0], [3, 0], [2, 2]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[0, -2], [-3, 0], [3, 0]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[-3, 0], [-2, -2], [0, -2]], color: [0.333, 0.420, 0.184, 1.0] },
        { vertices: [[3, 0], [2, -2], [0, -2]], color: [0.333, 0.420, 0.184, 1.0] }, 
        { vertices: [[-1, -3], [-1, -2], [-2, -2]], color: [0.333, 0.420, 0.184, 1.0] },
        { vertices: [[1, -3], [1, -2], [2, -2]], color: [0.333, 0.420, 0.184, 1.0] },
        { vertices: [[-1, -3], [-1, -2], [2, -3]], color: [0.333, 0.420, 0.184, 1.0] },
        { vertices: [[1, -3], [1, -2], [-2, -2]], color: [0.333, 0.420, 0.184, 1.0] },
        // tail
        { vertices: [[0, -4], [-1, -3], [1, -3]], color: [0.54, 0.32, 0.165, 1.0] },
        // left leg
        { vertices: [[-1, -3], [-2, -2], [-2, -4]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[-2, -2], [-2, -4], [-3, -3]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[-3, -3], [-3, -4], [-2, -4]], color: [0.561, 0.737, 0.561, 1.0] },
        // right leg
        { vertices: [[1, -3], [2, -2], [2, -4]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[2, -2], [2, -4], [3, -3]], color: [0.561, 0.737, 0.561, 1.0] },
        { vertices: [[3, -3], [3, -4], [2, -4]], color: [0.561, 0.737, 0.561, 1.0] }
    ];

    // Clear the canvas before drawing
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set color and size uniforms
    gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
    gl.uniform1f(u_Size, g_selectedSize);

    for (let tri of triangles) {
        let scaled = tri.vertices.flatMap(v => [v[0] / 5, v[1] / 5]);
    
        // Set the specific color for this triangle
        gl.uniform4f(u_FragColor, tri.color[0], tri.color[1], tri.color[2], tri.color[3]);
    
        // Create buffer and draw
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scaled), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_position);
    
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}    
