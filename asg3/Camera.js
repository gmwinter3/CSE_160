// Camera.js
// ----------------------------------------------
// A structured FPS-style camera with Vector3/Matrix4
// ----------------------------------------------

class Camera {
  static DIRECTIONS = {
    FORWARD: 0,
    BACKWARD: 1,
    LEFT: 2,
    RIGHT: 3,
    UP: 4,
    DOWN: 5
  };

  constructor() {
    this.fov = 60;
    this.eye = new Vector3([32, 4.5, 32]);  // Center of floor, slightly above it
    this.at  = new Vector3([16, 4.5, 15]);  // Looking down -Z
    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.mouseSensitivity = 0.1;
    this.movementSpeed = 10.0;

    this.setView();
    this.resetPerspective();

    this.yaw = -90;
    this.pitch = 0;
    this.updateFront();
  }

  resetPerspective() {
    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
  }

  setView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  getViewMatrix() {
    return this.viewMatrix;
  }

  updateFront() {
    const radYaw = this.yaw * Math.PI / 180;
    const radPitch = this.pitch * Math.PI / 180;

    const front = new Vector3([
      Math.cos(radYaw) * Math.cos(radPitch),
      Math.sin(radPitch),
      Math.sin(radYaw) * Math.cos(radPitch)
    ]);
    front.normalize();

    this.front = front;
    this.at.set(this.eye);
    this.at.add(this.front);
    this.setView();
  }

  move(speed, direction) {
    if (speed === 0) return;

    let movement = new Vector3();

    switch (direction) {
      case Camera.DIRECTIONS.FORWARD:
        movement.set(this.front);
        break;
      case Camera.DIRECTIONS.BACKWARD:
        movement.set(this.front).mul(-1);
        break;
      case Camera.DIRECTIONS.LEFT: {
        const right = Vector3.cross(this.front, this.up);
        movement.set(right).mul(-1);
        break;
      }
      case Camera.DIRECTIONS.RIGHT: {
        const right = Vector3.cross(this.front, this.up);
        movement.set(right);
        break;
      }
      case Camera.DIRECTIONS.UP:
        movement.set(this.up);
        break;
      case Camera.DIRECTIONS.DOWN:
        movement.set(this.up).mul(-1);
        break;
    }

    movement.normalize().mul(speed);

    // Prevent going out of world bounds
    const next = new Vector3(this.eye);
    next.add(movement);
    // if (next.elements[0] < -16 || next.elements[0] > 48 ||
    //    next.elements[2] < -16 || next.elements[2] > 48) return;

    this.eye.add(movement);
    this.at.add(movement);
    this.setView();
  }

  update(dt) {
    const velocity = this.movementSpeed * dt;

    if (keys['w']) this.move(velocity, Camera.DIRECTIONS.FORWARD);
    if (keys['s']) this.move(velocity, Camera.DIRECTIONS.BACKWARD);
    if (keys['a']) this.move(velocity, Camera.DIRECTIONS.LEFT);
    if (keys['d']) this.move(velocity, Camera.DIRECTIONS.RIGHT);
    if (keys[' ']) this.move(velocity, Camera.DIRECTIONS.UP);         
    if (keys['shift']) this.move(velocity, Camera.DIRECTIONS.DOWN);
  }

  processMouseMovement(dx, dy) {
    dx *= this.mouseSensitivity;
    dy *= this.mouseSensitivity;

    this.yaw += dx;
    this.pitch = Math.max(-89.0, Math.min(89.0, this.pitch + dy));

    this.updateFront();
  }
}

// Utility: global keyboard state
const keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });

window.Camera = Camera;
