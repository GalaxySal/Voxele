import * as THREE from "three";
import { buildChunkMesh, createChunkMesh } from "./ChunkMeshBuilder";
import { getChunk } from "../ipc/gameClient";
import { CHUNK_SIZE } from "./types";
import type { ChunkPos } from "./types";

const RENDER_DISTANCE = 6;

export class ChunkMeshManager {
  private scene: THREE.Scene;
  private meshes = new Map<string, THREE.Mesh>();
  private chunks = new Map<string, Uint8Array>();
  private texture: THREE.Texture | null = null;
  private topTex = new Uint8Array(256);
  private sideTex = new Uint8Array(256);
  private bottomTex = new Uint8Array(256);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initTexture();
    this.initBlockTextures();
  }

  private initTexture(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    const colors: Record<number, string> = {
      0: "rgba(0,0,0,0)",
      1: "#8B4513",
      2: "#4CAF50",
      3: "#808080",
      4: "#7a7a7a",
      5: "#6B3A2A",
      6: "#C4A46C",
      7: "#2E7D32",
      8: "#C2B280",
      9: "#2196F3",
      10: "#333333",
      11: "#FFFFFF",
    };

    const ts = 16;
    Object.entries(colors).forEach(([id, color]) => {
      const idx = parseInt(id);
      const tileX = (idx % 16) * ts;
      const tileY = Math.floor(idx / 16) * ts;
      ctx.fillStyle = color;
      ctx.fillRect(tileX, tileY, ts, ts);
      if (idx > 0) {
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.strokeRect(tileX, tileY, ts, ts);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.texture = tex;
  }

  private initBlockTextures(): void {
    for (let i = 0; i < 256; i++) {
      this.topTex[i] = i;
      this.sideTex[i] = i;
      this.bottomTex[i] = i;
    }
    this.topTex[2] = 0;
    this.sideTex[2] = 3;
    this.bottomTex[2] = 2;
  }

  async loadChunks(chunks: ChunkPos[]): Promise<void> {
    const promises = chunks.map(async (pos) => {
      const key = `${pos.x},${pos.z}`;
      if (this.chunks.has(key)) return;
      try {
        const data = await getChunk(pos.x, pos.z);
        this.chunks.set(key, data);
        this.buildMesh(pos);
      } catch (e) {
        console.error(`Failed to load chunk ${key}:`, e);
      }
    });
    await Promise.all(promises);
  }

  private buildMesh(pos: ChunkPos): void {
    const key = `${pos.x},${pos.z}`;
    const blocks = this.chunks.get(key);
    if (!blocks) return;

    const neighborBlocks = {
      left: this.chunks.get(`${pos.x - 1},${pos.z}`) ?? null,
      right: this.chunks.get(`${pos.x + 1},${pos.z}`) ?? null,
      front: this.chunks.get(`${pos.x},${pos.z + 1}`) ?? null,
      back: this.chunks.get(`${pos.x},${pos.z - 1}`) ?? null,
      top: null,
      bottom: null,
    };

    const meshData = buildChunkMesh(
      blocks,
      neighborBlocks,
      this.topTex,
      this.sideTex,
      this.bottomTex,
    );

    if (!this.texture) return;
    const mesh = createChunkMesh(meshData, this.texture);
    mesh.position.set(pos.x * CHUNK_SIZE, 0, pos.z * CHUNK_SIZE);
    mesh.frustumCulled = true;
    this.meshes.set(key, mesh);
    this.scene.add(mesh);
  }

  private unloadChunk(key: string): void {
    const mesh = this.meshes.get(key);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      this.meshes.delete(key);
    }
    this.chunks.delete(key);
  }

  update(playerPos: THREE.Vector3): void {
    const px = Math.floor(playerPos.x / CHUNK_SIZE);
    const pz = Math.floor(playerPos.z / CHUNK_SIZE);

    const toLoad: ChunkPos[] = [];
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > RENDER_DISTANCE) continue;
        const cx = px + dx;
        const cz = pz + dz;
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
          toLoad.push({ x: cx, z: cz });
        }
      }
    }

    const toUnload: string[] = [];
    for (const key of this.meshes.keys()) {
      const [cx, cz] = key.split(",").map(Number);
      const dx = cx - px;
      const dz = cz - pz;
      if (Math.sqrt(dx * dx + dz * dz) > RENDER_DISTANCE + 1) {
        toUnload.push(key);
      }
    }

    toUnload.forEach((k) => this.unloadChunk(k));
    if (toLoad.length > 0) this.loadChunks(toLoad);
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.meshes.clear();
    this.chunks.clear();
  }
}


