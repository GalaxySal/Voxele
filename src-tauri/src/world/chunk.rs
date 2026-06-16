use super::block::BlockId;
use super::coordinates::{ChunkPos, CHUNK_HEIGHT, CHUNK_SIZE, CHUNK_VOLUME};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chunk {
    pub pos: ChunkPos,
    pub blocks: Vec<BlockId>,
    pub dirty: bool,
}

impl Chunk {
    pub fn new(pos: ChunkPos) -> Self {
        Self {
            pos,
            blocks: vec![0; CHUNK_VOLUME],
            dirty: true,
        }
    }

    fn index(&self, x: usize, y: usize, z: usize) -> usize {
        y * (CHUNK_SIZE as usize * CHUNK_SIZE as usize) + z * CHUNK_SIZE as usize + x
    }

    pub fn get_block(&self, x: usize, y: usize, z: usize) -> BlockId {
        self.blocks[self.index(x, y, z)]
    }

    pub fn set_block(&mut self, x: usize, y: usize, z: usize, block: BlockId) {
        let idx = self.index(x, y, z);
        if self.blocks[idx] != block {
            self.blocks[idx] = block;
            self.dirty = true;
        }
    }

    pub fn fill(&mut self, block: BlockId) {
        self.blocks.fill(block);
        self.dirty = true;
    }

    pub fn fill_layer(&mut self, y: usize, block: BlockId) {
        let start = y * (CHUNK_SIZE as usize * CHUNK_SIZE as usize);
        let end = start + (CHUNK_SIZE as usize * CHUNK_SIZE as usize);
        for i in start..end {
            self.blocks[i] = block;
        }
        self.dirty = true;
    }

    pub fn raw_blocks(&self) -> &[BlockId] {
        &self.blocks
    }

    pub fn raw_blocks_mut(&mut self) -> &mut [BlockId] {
        self.dirty = true;
        &mut self.blocks
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        bincode::serialize(self).unwrap_or_default()
    }

    pub fn from_bytes(pos: ChunkPos, data: &[u8]) -> Option<Self> {
        bincode::deserialize(data).ok()
    }
}
