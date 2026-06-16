import { useEffect, useRef } from "react";
import { GameEngine } from "./game/GameEngine";
import { GameHUD } from "./ui/GameHUD";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.start();

    engine.loadWorld(42, 4);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: "none" }}
      />
      <GameHUD engine={engineRef.current} />
    </div>
  );
}

export default App;
