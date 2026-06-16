pub mod block;
pub mod chunk;
pub mod coordinates;

use block::{BlockId, AIR, BEDROCK, GRASS, STONE};
use chunk::Chunk;
use coordinates::{BlockPos, ChunkPos, CHUNK_HEIGHT, CHUNK_SIZE};
use std::collections::HashMap;

pub struct World {
    pub chunks: HashMap<ChunkPos, Chunk>,
    pub seed: u32,
}

impl World {
    pub fn new(seed: u32) -> Self {
        Self {
            chunks: HashMap::new(),
            seed,
        }
    }

    pub fn get_chunk(&mut self, pos: ChunkPos) -> &mut Chunk {
        self.chunks.entry(pos).or_insert_with(|| {
            let mut chunk = Chunk::new(pos);
            generate_terrain(&mut chunk, pos, self.seed);
            chunk
        })
    }

    pub fn get_block(&mut self, pos: BlockPos) -> BlockId {
        let chunk_pos = pos.chunk_pos();
        if let Some(chunk) = self.chunks.get_mut(&chunk_pos) {
            let (lx, ly, lz) = pos.local_pos();
            chunk.get_block(lx, ly, lz)
        } else {
            AIR
        }
    }

    pub fn set_block(&mut self, pos: BlockPos, block: BlockId) -> bool {
        if pos.y < 0 || pos.y >= CHUNK_HEIGHT {
            return false;
        }
        let chunk_pos = pos.chunk_pos();
        let chunk = self.get_chunk(chunk_pos);
        let (lx, ly, lz) = pos.local_pos();
        chunk.set_block(lx, ly, lz, block);
        true
    }

    pub fn chunk_exists(&self, pos: ChunkPos) -> bool {
        self.chunks.contains_key(&pos)
    }
}

fn generate_terrain(chunk: &mut Chunk, pos: ChunkPos, seed: u32) {
    use noise::NoiseFn;

    use noise::Seedable;
    let mut perlin = noise::Perlin::default();
    perlin.set_seed(seed);
    let height_scale = 12.0;
    let base_height = 64;

    for lx in 0..CHUNK_SIZE as usize {
        for lz in 0..CHUNK_SIZE as usize {
            let wx = pos.x * CHUNK_SIZE + lx as i32;
            let wz = pos.z * CHUNK_SIZE + lz as i32;

            let noise_val = perlin.get([wx as f64 * 0.02, wz as f64 * 0.02]);
            let height = (noise_val * height_scale + base_height as f64) as i32;
            let height = height.clamp(1, CHUNK_HEIGHT - 1);

            for ly in 0..CHUNK_HEIGHT as usize {
                let block = if ly == 0 {
                    BEDROCK
                } else if ly as i32 == height {
                    GRASS
                } else if (ly as i32) < height {
                    STONE
                } else {
                    AIR
                };
                chunk.set_block(lx, ly, lz, block);
            }
        }
    }
}
