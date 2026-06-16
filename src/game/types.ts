export type BlockId = number;

export const AIR: BlockId = 0;
export const DIRT: BlockId = 1;
export const GRASS: BlockId = 2;
export const STONE: BlockId = 3;
export const COBBLESTONE: BlockId = 4;
export const WOOD: BlockId = 5;
export const PLANKS: BlockId = 6;
export const LEAVES: BlockId = 7;
export const SAND: BlockId = 8;
export const WATER: BlockId = 9;
export const BEDROCK: BlockId = 10;
export const SNOW: BlockId = 11;

export interface ChunkPos {
  x: number;
  z: number;
}

export interface BlockPos {
  x: number;
  y: number;
  z: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 256;

export function blockIndex(x: number, y: number, z: number): number {
  return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
}

export function localPos(wx: number, wy: number, wz: number): [number, number, number] {
  return [
    ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
    Math.max(0, Math.min(CHUNK_HEIGHT - 1, wy)),
    ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
  ];
}
