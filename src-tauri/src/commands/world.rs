use crate::world::block::BlockId;
use crate::world::coordinates::{BlockPos, ChunkPos};
use crate::world::World;
use std::sync::Mutex;
use tauri::ipc::Response;
use tauri::State;

pub struct WorldState(pub Mutex<World>);

#[tauri::command]
pub fn get_chunk(
    state: State<WorldState>,
    x: i32,
    z: i32,
) -> Result<Response, String> {
    let pos = ChunkPos::new(x, z);
    let mut world = state.0.lock().map_err(|e| e.to_string())?;
    let chunk = world.get_chunk(pos);
    let bytes = chunk.to_bytes();
    Ok(Response::new(bytes))
}

#[tauri::command]
pub fn set_block(
    state: State<WorldState>,
    x: i32,
    y: i32,
    z: i32,
    block: BlockId,
) -> Result<bool, String> {
    let pos = BlockPos::new(x, y, z);
    let mut world = state.0.lock().map_err(|e| e.to_string())?;
    Ok(world.set_block(pos, block))
}

#[tauri::command]
pub fn get_block(
    state: State<WorldState>,
    x: i32,
    y: i32,
    z: i32,
) -> Result<BlockId, String> {
    let pos = BlockPos::new(x, y, z);
    let mut world = state.0.lock().map_err(|e| e.to_string())?;
    Ok(world.get_block(pos))
}

#[tauri::command]
pub fn generate_world(
    state: State<WorldState>,
    seed: u32,
    radius: i32,
) -> Result<Vec<ChunkPos>, String> {
    let mut world = state.0.lock().map_err(|e| e.to_string())?;
    *world = World::new(seed);
    let mut loaded = Vec::new();
    for cx in -radius..=radius {
        for cz in -radius..=radius {
            let pos = ChunkPos::new(cx, cz);
            world.get_chunk(pos);
            loaded.push(pos);
        }
    }
    Ok(loaded)
}

#[tauri::command]
pub fn get_player_state(
    state: State<WorldState>,
) -> Result<(f64, f64, f64, f32, f32), String> {
    let _world = state.0.lock().map_err(|e| e.to_string())?;
    Ok((0.0, 100.0, 0.0, 0.0, 0.0))
}
