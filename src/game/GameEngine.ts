import * as THREE from "three";
import { PlayerController } from "./PlayerController";
import { ChunkMeshManager } from "./ChunkMeshManager";
import type { ChunkPos } from "./types";

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public playerController: PlayerController;
  public chunkManager: ChunkMeshManager;
  private animFrameId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 200);

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      300,
    );
    this.camera.position.set(0, 120, 0);

    this.setupLights();
    this.setupResize();

    this.chunkManager = new ChunkMeshManager(this.scene);
    this.playerController = new PlayerController(this.camera, canvas);
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(-50, 200, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a7d44, 0.4);
    this.scene.add(hemiLight);
  }

  private setupResize(): void {
    window.addEventListener("resize", () => {
      const canvas = this.renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
    });
  }

  get playerPos(): THREE.Vector3 {
    return this.camera.position;
  }

  get playerChunk(): ChunkPos {
    return {
      x: Math.floor(this.camera.position.x / 16),
      z: Math.floor(this.camera.position.z / 16),
    };
  }

  async loadWorld(seed: number, renderDistance: number): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core");
    const chunks = await invoke<ChunkPos[]>("generate_world", {
      seed,
      radius: renderDistance,
    });
    await this.chunkManager.loadChunks(chunks);
  }

  start(): void {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (time: number): void => {
    this.animFrameId = requestAnimationFrame(this.loop);
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.playerController.update(dt);
    this.chunkManager.update(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.stop();
    this.renderer.dispose();
    this.scene.clear();
  }
}
