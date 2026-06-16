use serde::{Deserialize, Serialize};

pub const CHUNK_SIZE: i32 = 16;
pub const CHUNK_HEIGHT: i32 = 256;
pub const CHUNK_VOLUME: usize = (CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT) as usize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ChunkPos {
    pub x: i32,
    pub z: i32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct BlockPos {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

impl BlockPos {
    pub fn new(x: i32, y: i32, z: i32) -> Self {
        Self { x, y, z }
    }

    pub fn chunk_pos(&self) -> ChunkPos {
        ChunkPos {
            x: self.x.div_euclid(CHUNK_SIZE),
            z: self.z.div_euclid(CHUNK_SIZE),
        }
    }

    pub fn local_pos(&self) -> (usize, usize, usize) {
        let lx = self.x.rem_euclid(CHUNK_SIZE) as usize;
        let ly = self.y.clamp(0, CHUNK_HEIGHT - 1) as usize;
        let lz = self.z.rem_euclid(CHUNK_SIZE) as usize;
        (lx, ly, lz)
    }

    pub fn index(&self) -> Option<usize> {
        if self.y < 0 || self.y >= CHUNK_HEIGHT {
            return None;
        }
        let (lx, ly, lz) = self.local_pos();
        Some(ly * (CHUNK_SIZE as usize * CHUNK_SIZE as usize) + lz * CHUNK_SIZE as usize + lx)
    }

    pub fn from_index(x: i32, z: i32, index: usize) -> Self {
        let ly = index / (CHUNK_SIZE as usize * CHUNK_SIZE as usize);
        let remainder = index % (CHUNK_SIZE as usize * CHUNK_SIZE as usize);
        let lz = remainder / CHUNK_SIZE as usize;
        let lx = remainder % CHUNK_SIZE as usize;
        Self {
            x: x * CHUNK_SIZE + lx as i32,
            y: ly as i32,
            z: z * CHUNK_SIZE + lz as i32,
        }
    }
}

impl ChunkPos {
    pub fn new(x: i32, z: i32) -> Self {
        Self { x, z }
    }

    pub fn distance_sq(&self, other: &ChunkPos) -> i32 {
        let dx = self.x - other.x;
        let dz = self.z - other.z;
        dx * dx + dz * dz
    }
}
