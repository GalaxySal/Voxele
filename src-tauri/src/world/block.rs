use serde::{Deserialize, Serialize};

pub type BlockId = u16;

pub const AIR: BlockId = 0;
pub const DIRT: BlockId = 1;
pub const GRASS: BlockId = 2;
pub const STONE: BlockId = 3;
pub const COBBLESTONE: BlockId = 4;
pub const WOOD: BlockId = 5;
pub const PLANKS: BlockId = 6;
pub const LEAVES: BlockId = 7;
pub const SAND: BlockId = 8;
pub const WATER: BlockId = 9;
pub const BEDROCK: BlockId = 10;
pub const SNOW: BlockId = 11;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockDef {
    pub id: BlockId,
    pub name: &'static str,
    pub solid: bool,
    pub transparent: bool,
    pub top_tex: u8,
    pub side_tex: u8,
    pub bottom_tex: u8,
}

impl BlockDef {
    pub const fn new(
        id: BlockId,
        name: &'static str,
        solid: bool,
        transparent: bool,
        tex: u8,
    ) -> Self {
        Self {
            id,
            name,
            solid,
            transparent,
            top_tex: tex,
            side_tex: tex,
            bottom_tex: tex,
        }
    }

    pub const fn with_top(mut self, top: u8) -> Self {
        self.top_tex = top;
        self
    }

    pub const fn with_sides(mut self, side: u8) -> Self {
        self.side_tex = side;
        self
    }

    pub const fn with_bottom(mut self, bottom: u8) -> Self {
        self.bottom_tex = bottom;
        self
    }
}

pub struct BlockRegistry {
    blocks: Vec<BlockDef>,
}

impl BlockRegistry {
    pub fn new() -> Self {
        let blocks = vec![
            BlockDef::new(AIR, "Air", false, true, 0),
            BlockDef::new(DIRT, "Dirt", true, false, 2)
                .with_top(2).with_sides(2).with_bottom(2),
            BlockDef::new(GRASS, "Grass", true, false, 0)
                .with_top(0).with_sides(3).with_bottom(2),
            BlockDef::new(STONE, "Stone", true, false, 1),
            BlockDef::new(COBBLESTONE, "Cobblestone", true, false, 4),
            BlockDef::new(WOOD, "Wood", true, false, 5)
                .with_top(5).with_sides(5).with_bottom(5),
            BlockDef::new(PLANKS, "Planks", true, false, 6),
            BlockDef::new(LEAVES, "Leaves", false, true, 7),
            BlockDef::new(SAND, "Sand", true, false, 8),
            BlockDef::new(WATER, "Water", false, true, 9),
            BlockDef::new(BEDROCK, "Bedrock", true, false, 10),
            BlockDef::new(SNOW, "Snow", true, false, 11)
                .with_top(11).with_sides(11).with_bottom(11),
        ];
        Self { blocks }
    }

    pub fn get(&self, id: BlockId) -> &BlockDef {
        if id == AIR {
            &self.blocks[0]
        } else {
            &self.blocks[id as usize]
        }
    }

    pub fn is_solid(&self, id: BlockId) -> bool {
        self.get(id).solid
    }

    pub fn is_transparent(&self, id: BlockId) -> bool {
        self.get(id).transparent
    }
}
