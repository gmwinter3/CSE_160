import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Water } from 'three/addons/objects/Water.js';



function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // skycube ------------------------------------------------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  
  const loader = new THREE.TextureLoader();
  const faceTexture = loader.load('textures/opal_night.jpg');

  const materials = Array(6).fill().map(() => new THREE.MeshBasicMaterial({
    map: faceTexture,
    side: THREE.BackSide // So texture is visible from inside the cube
  }));

  const skyCube = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    materials
  );
  skyCube.receiveShadow = true;
  scene.add(skyCube);


  // camera ------------------------------------------------------------------------------------------------------------------------
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 5); // Eye height

  // Platform ------------------------------------------------------------------------------------------------------------------------
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.1, 50),
    new THREE.MeshPhongMaterial({ color: 0x888888 })
  );
  platform.position.y = -0.05;
  platform.receiveShadow = true;
  scene.add(platform);

  // Pyramid
  const marbleTex = new THREE.TextureLoader().load('textures/marble.jpg');  // Update path if needed

  const pyramidGeometry = new THREE.ConeGeometry(10, 10, 4);
  const pyramidMaterial = new THREE.MeshPhongMaterial({ map: marbleTex });
  const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
  pyramid.rotation.y = Math.PI / 4;
  pyramid.position.y = 2.5;
  pyramid.castShadow = true;
  pyramid.receiveShadow = true;
  scene.add(pyramid);

  // Dodecahedron above the pyramid
  const dodecaGeometry = new THREE.DodecahedronGeometry(1);
  const dodecaMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffcc, shininess: 100 });
  const dodeca = new THREE.Mesh(dodecaGeometry, dodecaMaterial);
  dodeca.position.set(0, 9, 0); // Slightly above the 5-unit tall pyramid
  dodeca.castShadow = true;
  dodeca.receiveShadow = true;
  scene.add(dodeca);

  // ice cube ------------------------------------------------------------------------------------------------------------------------
  const texLoader = new THREE.TextureLoader();
  const iceColorMap = texLoader.load('textures/Ice002_1K-JPG_Color.jpg');
  const iceNormalMap = texLoader.load('textures/Ice002_1K-JPG_NormalGL.jpg');
  const iceRoughnessMap = texLoader.load('textures/Ice002_1K-JPG_Roughness.jpg');
  const iceDisplacementMap = texLoader.load('textures/Ice002_1K-JPG_Displacement.jpg');
  const iceOverlayMap = texLoader.load('textures/Ice003_1K-JPG_Color.jpg');
  
  iceColorMap.encoding = THREE.sRGBEncoding;
  iceOverlayMap.encoding = THREE.sRGBEncoding;
  iceNormalMap.encoding = THREE.LinearEncoding;
  iceRoughnessMap.encoding = THREE.LinearEncoding;
  iceDisplacementMap.encoding = THREE.LinearEncoding;
  
  const cubeGeometry = new THREE.BoxGeometry(5, 5, 5, 256, 256, 256);  // more segments for displacement
  const cubeMaterial1 = new THREE.MeshStandardMaterial({
    map: iceColorMap,
    normalMap: iceNormalMap,
    roughnessMap: iceRoughnessMap,
    displacementMap: iceDisplacementMap,
    displacementScale: 0,
    metalness: 1,
    roughness: 1,
    envMapIntensity: 2.0
  });
  
  const iceCube1 = new THREE.Mesh(cubeGeometry, cubeMaterial1);
  iceCube1.position.set(15, 2.5, -15);
  iceCube1.castShadow = true;
  iceCube1.receiveShadow = true;
  scene.add(iceCube1);

  const cubeMaterial2 = new THREE.MeshStandardMaterial({
    map: iceColorMap,
    normalMap: iceNormalMap,
    roughnessMap: iceRoughnessMap,
    displacementMap: iceDisplacementMap,
    displacementScale: 0,
    metalness: 0.0,
    roughness: 1,
    envMapIntensity: 2
  });
  
  const iceCube2 = new THREE.Mesh(cubeGeometry, cubeMaterial2);
  iceCube2.position.set(10, 2.5, -15);
  iceCube2.castShadow = true;
  iceCube2.receiveShadow = true;
  scene.add(iceCube2);

  const cubeMaterial3 = new THREE.MeshStandardMaterial({
    map: iceColorMap,
    normalMap: iceNormalMap,
    roughnessMap: iceRoughnessMap,
    displacementMap: iceDisplacementMap,
    metalness: 0,
    roughness: 0,
    envMapIntensity: 2.0
  });
  
  const iceCube3 = new THREE.Mesh(cubeGeometry, cubeMaterial3);
  iceCube3.position.set(20, 2.5, -15);
  iceCube3.castShadow = true;
  iceCube3.receiveShadow = true;
  scene.add(iceCube3);

  // pools ------------------------------------------------------------------------------------------------------------------------
  const waterNormals = new THREE.TextureLoader().load('textures/waternormals.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });
  
  const waterMeshes = []; // Add this at the top near other globals

  function createWaterPool(x, z, width, depth) {
    const geometry = new THREE.PlaneGeometry(width, depth);
  
    const direction = new THREE.Vector3(x, 0, z).normalize();
  
    const water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      sunDirection: direction,
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });
  
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.01, z);
    scene.add(water);
    waterMeshes.push(water);
  
    // === Rim around the pool ===
    const rimHeight = 0.2;
    const rimThickness = 0.3;
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

  
    // Front rim
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(width + rimThickness * 2, rimHeight, rimThickness),
      rimMaterial
    );
    front.position.set(x, rimHeight / 2, z - depth / 2 - rimThickness / 2);
    scene.add(front);
  
    // Back rim
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(width + rimThickness * 2, rimHeight, rimThickness),
      rimMaterial
    );
    back.position.set(x, rimHeight / 2, z + depth / 2 + rimThickness / 2);
    scene.add(back);
  
    // Left rim
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(rimThickness, rimHeight, depth),
      rimMaterial
    );
    left.position.set(x - width / 2 - rimThickness / 2, rimHeight / 2, z);
    scene.add(left);
  
    // Right rim
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(rimThickness, rimHeight, depth),
      rimMaterial
    );
    right.position.set(x + width / 2 + rimThickness / 2, rimHeight / 2, z);
    scene.add(right);
  }
  

  
  const poolWidth = 10;
  const poolDepth = 50;
  const platformSize = 50;
  
  createWaterPool(0, -platformSize / 2 + poolDepth / 2, poolWidth, poolDepth);  // front
  createWaterPool(0, platformSize / 2 - poolDepth / 2, poolWidth, poolDepth);   // back
  createWaterPool(-platformSize / 2 + poolDepth / 2, 0, poolDepth, poolWidth);  // left
  createWaterPool(platformSize / 2 - poolDepth / 2, 0, poolDepth, poolWidth);   // right

  // Möbius strip ------------------------------------------------------------------------------------------------------------------------
  function mobius(u, t, target) {
    u = u - 0.5;
    const v = 2 * Math.PI * t;
    const a = 2;

    const x = Math.cos(v) * (a + u * Math.cos(v / 2));
    const y = Math.sin(v) * (a + u * Math.cos(v / 2));
    const z = u * Math.sin(v / 2);

    target.set(x, y, z);
  }


  const mobiusGeometry = new ParametricGeometry(mobius, 100, 16);
  const opalTexture = new THREE.TextureLoader().load('textures/opal.jpg');
  opalTexture.encoding = THREE.sRGBEncoding;
  opalTexture.wrapS = THREE.RepeatWrapping;
  opalTexture.wrapT = THREE.RepeatWrapping;

  const mobiusMaterial = new THREE.MeshStandardMaterial({
    map: opalTexture,
    metalness: 0.6,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });

  const mobiusMesh = new THREE.Mesh(mobiusGeometry, mobiusMaterial);
  mobiusMesh.castShadow = true;
  mobiusMesh.receiveShadow = true;
  mobiusMesh.position.set(-15, 4, -15);
  mobiusMesh.scale.set(1.5, 1.5, 2);
  scene.add(mobiusMesh);


  // 3d objects ------------------------------------------------------------------------------------------------------------------------
  
  {
  const objLoader = new OBJLoader();
  objLoader.load('3d/leapingDolphin/leapingDolphin.obj', (root) => {
    root.rotation.x = -Math.PI / 2;
    root.rotation.z = -Math.PI;
    root.scale.set(0.1, 0.1, 0.1);
    root.position.set(15, 0, 15);
    root.traverse(n => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
      }
    });
    scene.add(root);
  });
  }
  
  texLoader.setPath('/3d/statue_v1/');

  const diffuseMap  = texLoader.load('12349_Statue_diff.jpg');
  const specularMap = texLoader.load('12349_Statue_spec.jpg');

  const statueMat = new THREE.MeshPhongMaterial({
    map:         diffuseMap,    // your color texture
    specularMap: specularMap,   // your highlight‐control texture
    specular:    0x888888,      // base specular color (tint)
    shininess:   30             // how tight the highlights are
  });

  {
  const objLoader = new OBJLoader();
  objLoader.load('3d/statue_v1/statue_v1.obj', (root) => {
    root.rotation.x = -Math.PI / 2;
    root.rotation.z = -Math.PI;

    root.scale.set(0.1, 0.1, 0.1);
    root.position.set(-15, 0, 15);
    root.traverse(node => {
      if (node.isMesh) {
        node.material = statueMat;
        node.castShadow = node.receiveShadow = true;
      }
    });
    scene.add(root);
  });
  }

  // pillars ------------------------------------------------------------------------------------------------------------------------
  const marblePillarTexture = new THREE.TextureLoader().load('textures/whiteMarble.jpg');
  marblePillarTexture.wrapS = marblePillarTexture.wrapT = THREE.RepeatWrapping;

  const pillarMaterial = new THREE.MeshStandardMaterial({ map: marblePillarTexture });

  // Function to create one pillar
  function createPillar(x, z) {
    const group = new THREE.Group();

    // Central cylinder
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 10, 32), pillarMaterial);
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    group.add(cyl);

    // Cross beams
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2), pillarMaterial);
    beam.position.y = 2.5;
    beam.castShadow = true;
    beam.receiveShadow = true;
    group.add(beam);

    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.3), pillarMaterial);
    beam1.position.y = 2.5;
    beam1.castShadow = true;
    beam1.receiveShadow = true;
    group.add(beam1);

    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), pillarMaterial);
    beam2.position.y = 5;
    beam2.castShadow = true;
    beam2.receiveShadow = true;
    group.add(beam2);

    group.position.set(x, 5, z); // Positioned on top of the platform (Y = 5 for 10 unit height)
    scene.add(group);
  }

  // Add pillars at each pyramid corner (rotated 45 deg, base ~10 wide)
  const offset = 7; // Distance from center to corner (half base width of pyramid)
  createPillar(-offset, -offset); // back left
  createPillar(offset, -offset);  // back right
  createPillar(offset, offset);   // front right
  createPillar(-offset, offset);  // front left


  // Pointer Lock Controls ------------------------------------------------------------------------------------------------------------------------
  const controls = new PointerLockControls(camera, document.body);
  scene.add(controls.object);

  document.body.addEventListener('click', () => controls.lock());

  const move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const speed = 200.0;

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': move.forward = true; break;
      case 'KeyS': move.backward = true; break;
      case 'KeyA': move.left = true; break;
      case 'KeyD': move.right = true; break;
      case 'Space': move.up = true; break;
      case 'ShiftLeft': move.down = true; break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': move.forward = false; break;
      case 'KeyS': move.backward = false; break;
      case 'KeyA': move.left = false; break;
      case 'KeyD': move.right = false; break;
      case 'Space': move.up = false; break;
      case 'ShiftLeft': move.down = false; break;
    }
  });

  // Lighting ------------------------------------------------------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  ambientLight.position.copy(dodeca.position);
  scene.add(ambientLight);

  // Directional light ----------------------------------------------------------------
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLight.position.set(0, 10, 0); // Light is above looking down
  directionalLight.target.position.set(0, 0, 0); // Aim at center
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;

  const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(dirLightHelper);

  // statue spotlight ----------------------------------------------------------------
  const spotlightPivot = new THREE.Object3D();
  scene.add(spotlightPivot);

  // Load the projection texture
  const projectionTexture = new THREE.TextureLoader().load('textures/marbleLighting.jpg');

  // Create spotlight with texture projection
  const spotlight = new THREE.SpotLight(0xffffff, 20);
  spotlight.angle = 0.5;
  spotlight.penumbra = 1;
  spotlight.decay = 0.5;
  spotlight.distance = 20;
  spotlight.castShadow = true;

  // Apply the texture as projection
  spotlight.map = projectionTexture;

  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;
  spotlight.shadow.camera.near = 1;
  spotlight.shadow.camera.far = 60;
  spotlight.shadow.focus = 1;

  // Set offset position relative to pivot
  spotlight.position.set(5, 12, 0);
  spotlightPivot.add(spotlight);

  // Set target to statue
  const statueTarget = new THREE.Object3D();
  statueTarget.position.set(-15, 1, 15); // Statue's location
  scene.add(statueTarget);
  spotlight.target = statueTarget;

  const lightHelper = new THREE.SpotLightHelper(spotlight);
  scene.add(lightHelper);

  // Dolphin Spotlight ----------------------------------------------------------------
  const oceanTexture = new THREE.TextureLoader().load('textures/ocean.jpg');

  // Create pivot for dolphin spotlight orbit
  const dolphinPivot = new THREE.Object3D();
  scene.add(dolphinPivot);

  // Create the spotlight
  const dolphinSpotlight = new THREE.SpotLight(0xffffff, 20);
  dolphinSpotlight.angle = 0.5;
  dolphinSpotlight.penumbra = 1;
  dolphinSpotlight.decay = 0.5;
  dolphinSpotlight.distance = 20;
  dolphinSpotlight.castShadow = true;

  // Project the ocean texture
  dolphinSpotlight.map = oceanTexture;

  dolphinSpotlight.shadow.mapSize.width = 1024;
  dolphinSpotlight.shadow.mapSize.height = 1024;
  dolphinSpotlight.shadow.camera.near = 1;
  dolphinSpotlight.shadow.camera.far = 60;
  dolphinSpotlight.shadow.focus = 1;

  // Set offset position relative to pivot
  dolphinSpotlight.position.set(5, 12, 0);
  dolphinPivot.add(dolphinSpotlight);

  // Target the dolphin
  const dolphinTarget = new THREE.Object3D();
  dolphinTarget.position.set(15, 1, 15); // Dolphin's location
  scene.add(dolphinTarget);
  dolphinSpotlight.target = dolphinTarget;

  const dolphinHelper = new THREE.SpotLightHelper(dolphinSpotlight);
  scene.add(dolphinHelper);



  // Möbius Strip Spotlights ----------------------------------------------------------------
  const mobiusLightPositions = [
    new THREE.Vector3(-15, 10, -25), // front
    new THREE.Vector3(-25, 10, -10), // left
    new THREE.Vector3(-5, 10, -10),  // right
  ];

  mobiusLightPositions.forEach((pos) => {
    const light = new THREE.SpotLight(0xffffff, 6);
    light.angle = 0.5;
    light.penumbra = 1;
    light.decay = 0.5;
    light.distance = 30;
    light.castShadow = true;

    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 60;
    light.shadow.focus = 1;

    light.position.copy(pos);

    const target = new THREE.Object3D();
    target.position.set(-15, 4, -15);
    scene.add(target);
    light.target = target;

    scene.add(light);
  });



  // Ice cube Spotlights ----------------------------------------------------------------
  const iceLightPositions = [
    new THREE.Vector3(15, 10, -25), // front
    new THREE.Vector3(5, 10, -15),  // left
    new THREE.Vector3(25, 10, -15), // right
  ];

  iceLightPositions.forEach((pos) => {
    const light = new THREE.SpotLight(0xffffff, 6);
    light.angle = 0.5;
    light.penumbra = 1;
    light.decay = 0.5;
    light.distance = 30;
    light.castShadow = true;

    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 60;
    light.shadow.focus = 1;

    light.position.copy(pos);

    const target = new THREE.Object3D();
    target.position.set(15, 2.5, -15);
    scene.add(target);
    light.target = target;

    scene.add(light);
  });



  // Animation loop ------------------------------------------------------------------------------------------------------------------------
  let prevTime = performance.now();

  function animate() {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    if (controls.isLocked) {
      direction.z = Number(move.forward) - Number(move.backward);
      direction.x = Number(move.right) - Number(move.left);
      direction.normalize();

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= velocity.y * 10.0 * delta;

      if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
      if (move.left || move.right) velocity.x -= direction.x * speed * delta;
      if (move.up) velocity.y += speed * delta;
      if (move.down) velocity.y -= speed * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      controls.object.position.y += velocity.y * delta;
    }

    // Dodecahedron rotation --------------------------------------------------------------
    let rotateDirection = 1;
    let lastSwitchTime = performance.now();

    // Reverse direction every 2 seconds
    if (time - lastSwitchTime > 2000) {
      rotateDirection *= -1;
      lastSwitchTime = time;
    }
    
    // Rotate diagonally
    dodeca.rotation.x += 0.05 * rotateDirection;
    dodeca.rotation.y += 0.05 * rotateDirection;
    dodeca.rotation.z += 0.05 * rotateDirection;
    
    // water movement --------------------------------------------------------
    for (const water of waterMeshes) {
      water.material.uniforms['time'].value += 0.2 / 60.0;
    }

    // statue spotlight --------------------------------------------------------
    spotlightPivot.position.set(-15, 0, 15);
    spotlightPivot.rotation.y += 0.004;

    // Orbit all spotlight pivots
    dolphinPivot.position.set(15, 0, 15);
    dolphinPivot.rotation.y += 0.004;

    lightHelper.update();
    dolphinHelper.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

main();
