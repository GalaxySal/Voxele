import * as THREE from "three";
import {
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  type BlockId,
  localPos,
} from "./types";

const FACES = [
  { dir: [-1, 0, 0], corners: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]] },
  { dir: [1, 0, 0], corners: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]] },
  { dir: [0, -1, 0], corners: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]] },
  { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]] },
  { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]] },
  { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]] },
];

const TEXTURE_POSITIONS: Record<number, [number, number]> = {
  0: [0, 0],
  1: [1, 0],
  2: [2, 0],
  3: [0, 1],
  4: [1, 1],
  5: [2, 1],
  6: [3, 0],
  7: [3, 1],
  8: [4, 0],
  9: [4, 1],
  10: [5, 0],
  11: [5, 1],
};

const TILES_PER_ROW = 16;
const TILE_SIZE = 1 / TILES_PER_ROW;

function getTextureUV(texIndex: number): [number, number] {
  return TEXTURE_POSITIONS[texIndex] ?? [0, 0];
}

export interface ChunkMeshData {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

export function buildChunkMesh(
  blocks: Uint8Array,
  neighborBlocks: {
    left: Uint8Array | null;
    right: Uint8Array | null;
    front: Uint8Array | null;
    back: Uint8Array | null;
    top: Uint8Array | null;
    bottom: Uint8Array | null;
  },
  topTex: Uint8Array,
  sideTex: Uint8Array,
  bottomTex: Uint8Array,
): ChunkMeshData {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  function getBlockAt(lx: number, ly: number, lz: number, faceDir: number[]): BlockId {
    const wx = lx + faceDir[0];
    const wy = ly + faceDir[1];
    const wz = lz + faceDir[2];

    if (wx >= 0 && wx < CHUNK_SIZE && wy >= 0 && wy < CHUNK_HEIGHT && wz >= 0 && wz < CHUNK_SIZE) {
      return blocks[wy * CHUNK_SIZE * CHUNK_SIZE + wz * CHUNK_SIZE + wx];
    }

    const [nx, ny, nz] = [wx, wy, wz];
    let neighbor: Uint8Array | null = null;
    if (nx < 0) neighbor = neighborBlocks.left;
    else if (nx >= CHUNK_SIZE) neighbor = neighborBlocks.right;
    else if (nz < 0) neighbor = neighborBlocks.back;
    else if (nz >= CHUNK_SIZE) neighbor = neighborBlocks.front;
    else if (ny < 0) neighbor = neighborBlocks.bottom;
    else if (ny >= CHUNK_HEIGHT) neighbor = neighborBlocks.top;

    if (!neighbor) return 0;
    const [lnx, lny, lnz] = localPos(nx, ny, nz);
    return neighbor[lny * CHUNK_SIZE * CHUNK_SIZE + lnz * CHUNK_SIZE + lnx];
  }

  function getTex(blockId: BlockId, faceIndex: number): number {
    const rawTex = [topTex[blockId] ?? 0, sideTex[blockId] ?? 0, bottomTex[blockId] ?? 0];
    if (faceIndex === 3) return rawTex[0];
    if (faceIndex === 2) return rawTex[2];
    return rawTex[1];
  }

  for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const block = blocks[ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx];
        if (block === 0) continue;

        FACES.forEach((face, fi) => {
          const neighbor = getBlockAt(lx, ly, lz, face.dir);
          if (neighbor !== 0) return;

          const texIndex = getTex(block, fi);
          const [texCol, texRow] = getTextureUV(texIndex);
          const tu = texCol * TILE_SIZE;
          const tv = texRow * TILE_SIZE;

          const ndx = positions.length / 3;
          for (const corner of face.corners) {
            positions.push(lx + corner[0], ly + corner[1], lz + corner[2]);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
          }

          const uvCorners = [
            [tu + TILE_SIZE, tv],
            [tu + TILE_SIZE, tv + TILE_SIZE],
            [tu, tv],
            [tu, tv + TILE_SIZE],
          ];
          for (const idx of [2, 0, 3, 1]) {
            uvs.push(uvCorners[idx][0], uvCorners[idx][1]);
          }

          indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
        });
      }
    }
  }

  return { positions, normals, uvs, indices };
}

export function createChunkMesh(
  data: ChunkMeshData,
  texture: THREE.Texture,
): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(data.positions, 3),
  );
  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(data.normals, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(data.uvs, 2));
  geometry.setIndex(data.indices);

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });

  return new THREE.Mesh(geometry, material);
}
