import { invoke } from "@tauri-apps/api/core";
import type { BlockId, ChunkPos } from "../game/types";

export async function getChunk(x: number, z: number): Promise<Uint8Array> {
  const response = await invoke<number[]>("get_chunk", { x, z });
  return new Uint8Array(response);
}

export async function setBlock(
  x: number,
  y: number,
  z: number,
  block: BlockId,
): Promise<boolean> {
  return invoke<boolean>("set_block", { x, y, z, block });
}

export async function getBlock(
  x: number,
  y: number,
  z: number,
): Promise<BlockId> {
  return invoke<BlockId>("get_block", { x, y, z });
}

export async function generateWorld(
  seed: number,
  radius: number,
): Promise<ChunkPos[]> {
  const chunks = await invoke<ChunkPos[]>("generate_world", { seed, radius });
  return chunks;
}

export async function getPlayerState(): Promise<
  [number, number, number, number, number]
> {
  return invoke<[number, number, number, number, number]>(
    "get_player_state",
  );
}
