import * as THREE from "three";
import { CHUNK_SIZE, CHUNK_HEIGHT } from "./types";
import type { BlockId } from "./types";

function getBlockAt(
  blocks: Map<string, Uint8Array>,
  x: number,
  y: number,
  z: number,
): BlockId {
  if (y < 0 || y >= CHUNK_HEIGHT) return 0;
  const cx = Math.floor(x / CHUNK_SIZE);
  const cz = Math.floor(z / CHUNK_SIZE);
  const key = `${cx},${cz}`;
  const chunk = blocks.get(key);
  if (!chunk) return 0;
  const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  return chunk[y * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx];
}

export interface RaycastResult {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  block: BlockId;
}

export function raycastBlocks(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDist: number,
  blocks: Map<string, Uint8Array>,
  step = 0.05,
): RaycastResult | null {
  const pos = origin.clone();
  const dir = direction.clone().normalize();
  const inc = dir.clone().multiplyScalar(step);

  let lastBlockPos = new THREE.Vector3(
    Math.floor(pos.x),
    Math.floor(pos.y),
    Math.floor(pos.z),
  );

  for (let i = 0; i < maxDist / step; i++) {
    pos.add(inc);

    const bx = Math.floor(pos.x);
    const by = Math.floor(pos.y);
    const bz = Math.floor(pos.z);

    const block = getBlockAt(blocks, bx, by, bz);
    if (block !== 0) {
      const normal = new THREE.Vector3(
        bx - lastBlockPos.x,
        by - lastBlockPos.y,
        bz - lastBlockPos.z,
      );
      return {
        position: new THREE.Vector3(bx, by, bz),
        normal,
        block,
      };
    }

    lastBlockPos.set(bx, by, bz);
  }

  return null;
}
