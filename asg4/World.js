// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_UseTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  varying vec4 v_VertPos;
  void main() {
    if (u_UseTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);

    } else if (u_UseTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_UseTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_UseTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else { 
      gl_FragColor = u_FragColor;
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    // if (r<2.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r<4.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0), 5.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn) {
      if (u_UseTexture == 0) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }
  }`

let canvas;
let gl;
let camera;

let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_UseTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;


let floorCube, skyCube;

let g_normalOn = false;
let g_lightPos=[0.5,9,0];
let g_lightDir = 1;
let g_lightOn = true;


let eyeX = 0, eyeY = 4, eyeZ = 20;
let atX  = 0, atY  = 4, atZ  =  0;
const moveSpeed = 1.0;

// Shapes array
let shapes = [];

// Global rotation
const globalRotMat = new Matrix4();


// -------------------------------------------------------------------- addActionsForHtmlUI --------------------------------------------------------------------------------
function addActionsForHtmlUI(){
  
  // buttons
  document.getElementById("normalOn").onclick = function () {
    g_normalOn=true;
    console.log("normalOn")
    initShapes()
  };
  document.getElementById("normalOff").onclick = function () {
    g_normalOn=false;
    console.log("normalOff")
    initShapes()
  };

  // sliders
  document.getElementById("lightSlideX").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById("lightSlideY").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById("lightSlideZ").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes();}});

}

// -------------------------------------------------------------------- connectVariablesToGLSL --------------------------------------------------------------------------------
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
  }
  // Get the storage location of a_Position
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

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
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
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
  }
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }  

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }  

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }
  
  // Get the storage location of u_UseTexture
  u_UseTexture = gl.getUniformLocation(gl.program, 'u_UseTexture');
  if (!u_UseTexture) {
    console.log('Failed to get the storage location of u_UseTexture');
    return;
  }
}

// -------------------------------------------------------------------- setupWebGL --------------------------------------------------------------------------------
function setupWebGL() {
    canvas = document.getElementById('cnv1');
    gl     = getWebGLContext(canvas, { antialias: false });
    gl.enable(gl.DEPTH_TEST);

  
    // Create our camera
    camera = new Camera(45, canvas.width / canvas.height, 1, 100);
  
    // Hook up pointer‐lock + mouse look
    canvas.addEventListener('mousedown', () => canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', onMouseMove);
      } else {
        document.removeEventListener('mousemove', onMouseMove);
      }
    });
}

// -------------------------------------------------------------------- onMouseMove --------------------------------------------------------------------------------
function onMouseMove(e) {
    camera.processMouseMovement(e.movementX, -e.movementY);
  }

// -------------------------------------------------------------------- initTextures --------------------------------------------------------------------------------
function initTextures(gl, n) {
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = 'grass.jpg';

  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendImageToTEXTURE2(image2); };
  // Tell the browser to load an image
  image2.src = 'opal_night.jpg';

  var image3 = new Image();  // Create the image object
  if (!image3) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image3.onload = function(){ sendImageToTEXTURE3(image3); };
  // Tell the browser to load an image
  image3.src = 'opal.jpg';
  return true;
}

// -------------------------------------------------------------------- sendImageToTEXTURE0 --------------------------------------------------------------------------------
function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

  console.log("finished sendImageToTEXTURE0")
}

function sendImageToTEXTURE2(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object for sky');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log("Finished loading sky texture into TEXTURE1");
}

function sendImageToTEXTURE3(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object for sky');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);

  console.log("Finished loading opal wall texture into TEXTURE3");
}

// -------------------------------------------------------------------- initShapes --------------------------------------------------------------------------------
function initShapes() {
  shapes = [];

  // DRAW FLOOR (32x32 flat cube)
  floorCube = new Cube();
  floorCube.color = [0.5, 0.5, 0.5, 1.0];  // Gray
  floorCube.useTexture = true;
  floorCube.textureNum = g_normalOn ? -3 : 1;  // -3 for normal, 1 for grass
  floorCube.matrix = new Matrix4()
    .translate(0, 0, 0)
    .scale(10,  0.02,  10);

  // DRAW SKY CUBE
  skyCube = new Cube();
  skyCube.color = [0.5, 0.5, 0.5, 1.0];  // Blue
  skyCube.useTexture = true;
  skyCube.textureNum = g_normalOn ? -3 : 2;  // -3 for normal, 2 for sky
  skyCube.matrix = new Matrix4()
    .translate(15, 10, 15)
    .scale(-20, -20, -20);

  // CENTER CUBE (unchanged)
  centerCube = new Cube();
  centerCube.color = [1.0, 0.0, 0.0, 1.0];  // Red
  centerCube.useTexture = true;
  centerCube.textureNum = g_normalOn ? -3 : 0;
  centerCube.matrix = new Matrix4()
    .translate(4, 0.5, 6)
    .scale(1, 1, 1);

  sphere = new Sphere();
  sphere.color = [0.0, 1.0, 0.0, 1.0];  // Green
  sphere.useTexture = true;
  sphere.textureNum = g_normalOn ? -3 : 0;
  sphere.matrix = new Matrix4()
    .translate(4.5, 1.25, 3)
    .scale(0.75, 0.75, 0.75);


}


// -------------------------------------------------------------------- main --------------------------------------------------------------------------------
function main() {

  setupWebGL();

  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Prepare shapes
  initShapes();
  initTextures();

  // Set clear color and start rendering loop
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  console.log("testpoint 1111111111111111");
  tick();
}

let lastTime = performance.now();
let frames = 0;
let fpsTime = 0;

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// -------------------------------------------------------------------- tick --------------------------------------------------------------------------------
function tick() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  g_seconds=performance.now()/1000.0-g_startTime;

  // Log to console
  // console.log(`Frame time: ${(dt * 1000).toFixed(2)} ms`);

  // Update HTML
  frames++;
  fpsTime += dt;
  if (fpsTime >= 1.0) {
    const fps = Math.round(frames / fpsTime);
    const fpsDisplay = document.getElementById('numdot');
    if (fpsDisplay) {
      fpsDisplay.innerText = `FPS: ${fps}`;
    } else {
      console.warn("Couldn't find element with ID 'numdot'");
    }
    frames = 0;
    fpsTime = 0;
  }

  updateAnimationAngles();

  camera.update(dt);
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  // Slide the light back and forth along x axis
  // Boundaries at x = 0.5 and x = 9.5
  const minX = -4;
  const maxX = 15;
  const speed = 2; // units per second, adjust as you wish

  g_lightPos[0] += g_lightDir * speed * (1/12); // assuming ~60fps, or use actual dt

  if (g_lightPos[0] >= maxX) {
    g_lightPos[0] = maxX;
    g_lightDir = -1;
  }
  if (g_lightPos[0] <= minX) {
    g_lightPos[0] = minX;
    g_lightDir = 1;
  }
}

// -------------------------------------------------------------------- renderAllShapes --------------------------------------------------------------------------------
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  
  // Use camera's view matrix
  var viewMat = camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // projection as before
  var projMat = new Matrix4()
    .setPerspective(90, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Cube.initVertexBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, _cubeVBO);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.5,-.5,-.5);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  floorCube.render();
  skyCube.render();
  centerCube.render();
  sphere.render();
}