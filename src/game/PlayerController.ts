import * as THREE from "three";

const KEYS: Record<string, boolean> = {};
const GRAVITY = -25;
const JUMP_SPEED = 8;
const WALK_SPEED = 6;
const SPRINT_MULTIPLIER = 1.6;
const MOUSE_SENSITIVITY = 0.002;

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public yaw = 0;
  public pitch = 0;
  public velocity = new THREE.Vector3();
  public onGround = false;
  public locked = false;
  private canvas: HTMLCanvasElement;
  private euler = new THREE.Euler(0, 0, 0, "YXZ");

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;
    this.setupInput();
  }

  private setupInput(): void {
    document.addEventListener("keydown", (e) => {
      KEYS[e.code] = true;
      if (e.code === "Escape") this.unlock();
    });

    document.addEventListener("keyup", (e) => {
      KEYS[e.code] = false;
    });

    this.canvas.addEventListener("click", () => {
      if (!this.locked) this.lock();
    });

    document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.locked) return;
      this.yaw -= e.movementX * MOUSE_SENSITIVITY;
      this.pitch -= e.movementY * MOUSE_SENSITIVITY;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    });
  }

  lock(): void {
    this.canvas.requestPointerLock();
  }

  unlock(): void {
    document.exitPointerLock();
  }

  update(dt: number): void {
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    const speed = KEYS["ShiftLeft"] || KEYS["ShiftRight"]
      ? WALK_SPEED * SPRINT_MULTIPLIER
      : WALK_SPEED;

    const moveDir = new THREE.Vector3();
    if (KEYS["KeyW"] || KEYS["ArrowUp"]) moveDir.add(forward);
    if (KEYS["KeyS"] || KEYS["ArrowDown"]) moveDir.sub(forward);
    if (KEYS["KeyA"] || KEYS["ArrowLeft"]) moveDir.sub(right);
    if (KEYS["KeyD"] || KEYS["ArrowRight"]) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
    }

    this.velocity.y += GRAVITY * dt;
    this.onGround = this.camera.position.y <= 0;
    if (this.onGround) {
      if (KEYS["Space"]) {
        this.velocity.y = JUMP_SPEED;
        this.onGround = false;
      } else {
        this.velocity.y = 0;
        this.camera.position.y = 0;
      }
    }

    this.camera.position.x += this.velocity.x * dt;
    this.camera.position.y += this.velocity.y * dt;
    this.camera.position.z += this.velocity.z * dt;
  }
}
