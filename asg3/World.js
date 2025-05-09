// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_UseTexture;
  void main() {
    if(u_UseTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_UseTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_UseTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else { 
      gl_FragColor = u_FragColor;
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

let floorCube, skyCube;


let eyeX = 0, eyeY = 4, eyeZ = 20;
let atX  = 0, atY  = 4, atZ  =  0;
const moveSpeed = 1.0;

// Shapes array
let shapes = [];

// Global rotation
const globalRotMat = new Matrix4();

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

// convert hue [0–360], sat [0–1], light [0–1] → [r,g,b]
function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r, g, b];
}


// -------------------------------------------------------------------- initShapes --------------------------------------------------------------------------------
function initShapes() {
    // DRAW FLOOR (32x32 flat cube)
    floorCube = new Cube();
    floorCube.useTexture = true; // Use the grass texture
    floorCube.textureNum = 1;
    floorCube.matrix = new Matrix4()
      .translate(0, 0, 0)
      .scale(32,  0.02,  32);

    // DRAW SKY CUBE (large blue cube)
    skyCube = new Cube();
    skyCube.color  = [0.0, 0.0, 1.0, 1.0];
    skyCube.useTexture = true;
    skyCube.textureNum = 2;
    skyCube.matrix = new Matrix4()
      .translate(-25, -25, -25)
      .scale(80, 80, 80);

  for (let x = 0; x < world.length; x++) {
    for (let z = 0; z < world[x].length; z++) {
      const height = world[x][z];
      for (let y = 0; y < height; y++) {
        const cube = new Cube();
        cube.matrix.translate(x, y, z);

                // Set color based on height (y)
        if (y === 0) {
          cube.color = [0.6, 0.3, 0.2, 1.0];  // base layer
        } else if (y === 1) {
          cube.color = [0.3, 0.6, 0.2, 1.0];  // middle
        } else if (y === 2) {
          cube.color = [0.2, 0.3, 0.6, 1.0];  // higher
        } else {
          cube.color = [0.8, 0.8, 0.2, 1.0];  // very high
        }
        shapes.push(cube);  // <-- store cube for later rendering
      }
    }
  }

  // ── Rainbow spiral from pyramid apex ──
  const apexX = 14 + 0.5;   // center X of your pyramid top
  const apexY = 4;          // height of pyramid
  const apexZ = 14 + 0.5;   // center Z of your pyramid top
  const spiralHeight = 10;  
  const spiralRadius = 2;   // how far out the spiral winds

  for (let i = 0; i < spiralHeight; i++) {
    const angle = i * 2 * Math.PI / spiralHeight;
    const x = apexX + Math.cos(angle) * spiralRadius;
    const y = apexY + i;    // stack one cube per level
    const z = apexZ + Math.sin(angle) * spiralRadius;

    const cube = new Cube();
    cube.isRainbow = true; 
    cube.matrix = new Matrix4().translate(x, y, z);

    // pick a rainbow color by cycling hue 0→360
    const [r, g, b] = hslToRgb(i * 360 / spiralHeight, 1, 0.5);
    cube.color = [r, g, b, 1.0];

    shapes.push(cube);
  }
}

// -------------------------------------------------------------------- main --------------------------------------------------------------------------------
function main() {

  setupWebGL();

  connectVariablesToGLSL();

  // Prepare shapes
  initShapes();
  initTextures();

  // Set clear color and start rendering loop
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  console.log("testpoint 1111111111111111");
  tick();
}

var world = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];  

let lastTime = performance.now();
let frames = 0;
let fpsTime = 0;

// -------------------------------------------------------------------- tick --------------------------------------------------------------------------------
function tick() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

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

  camera.update(dt);
  renderAllShapes();
  requestAnimationFrame(tick);
}

// -------------------------------------------------------------------- renderAllShapes --------------------------------------------------------------------------------
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Use camera's view matrix
  var viewMat = camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // projection as before
  var projMat = new Matrix4()
    .setPerspective(90, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  Cube.initVertexBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, _cubeVBO);

  floorCube.renderfaster();
  skyCube.renderfaster();

  gl.uniform1i(u_UseTexture, 3);
  for (let shape of shapes) {
    if (shape.isRainbow) continue;
    gl.uniform4f(u_FragColor,
      shape.color[0], shape.color[1],
      shape.color[2], shape.color[3]
    );
    gl.uniformMatrix4fv(u_ModelMatrix, false, shape.matrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

  // 2) draw *untextured* rainbow cubes
  gl.uniform1i(u_UseTexture, 0);
  for (let shape of shapes) {
    if (!shape.isRainbow) continue;
    gl.uniform4f(u_FragColor,
      shape.color[0], shape.color[1],
      shape.color[2], shape.color[3]
    );
    gl.uniformMatrix4fv(u_ModelMatrix, false, shape.matrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

}