import { useEffect, useState } from "react";
import type { GameEngine } from "../game/GameEngine";

interface HUDProps {
  engine: GameEngine | null;
}

export function GameHUD({ engine }: HUDProps) {
  const [fps, setFps] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  const [chunks, setChunks] = useState(0);

  useEffect(() => {
    if (!engine) return;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let running = true;

    const update = () => {
      if (!running) return;
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = now;
      }
      setPos({
        x: Math.round(engine.playerPos.x * 10) / 10,
        y: Math.round(engine.playerPos.y * 10) / 10,
        z: Math.round(engine.playerPos.z * 10) / 10,
      });
      setChunks(engine.chunkManager["meshes"].size);
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    return () => { running = false; };
  }, [engine]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-8 h-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80" />
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={`w-12 h-12 border-2 border-white/50 bg-black/40 flex items-center justify-center
              ${i === 0 ? "border-white border-3" : ""}`}
            style={{
              imageRendering: "pixelated",
              background: i < 9 ? `rgb(${50 + i * 20}, ${100 + i * 10}, ${50})` : undefined,
            }}
          >
            <span className="text-white text-xs font-bold">{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="fixed top-2 left-2 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded pointer-events-none space-y-0.5">
        <div>FPS: {fps}</div>
        <div>Pos: {pos.x}, {pos.y}, {pos.z}</div>
        <div>Chunks: {chunks}</div>
      </div>
    </>
  );
}
