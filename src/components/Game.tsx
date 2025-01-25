import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { Car } from './Car';

export function Game() {
  return (
    <div className="h-screen w-full">
      <Canvas shadows>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Environment and Ground */}
        <Environment preset="sunset" />
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={1}
          cellColor="#6f6f6f"
          sectionSize={3}
        />

        {/* Game Elements */}
        <Car />
      </Canvas>
    </div>
  );
}
