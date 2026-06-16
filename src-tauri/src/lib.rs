mod commands;
mod generation;
mod world;

use commands::WorldState;
use world::World;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(not(feature = "cef"))]
    let builder = tauri::Builder::<tauri::Wry>::new();
    #[cfg(feature = "cef")]
    let builder = tauri::Builder::<tauri::Cef>::new();

    builder
        .manage(WorldState(std::sync::Mutex::new(World::new(0))))
        .invoke_handler(tauri::generate_handler![
            commands::get_chunk,
            commands::set_block,
            commands::get_block,
            commands::generate_world,
            commands::get_player_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
