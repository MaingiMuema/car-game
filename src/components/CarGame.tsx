'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Suspense, useState } from 'react';
import Car from './Car';
import Track from './Track';
import Ground from './Ground';

export default function CarGame() {
  const [cameraPosition] = useState<[number, number, number]>([0, 5, 10]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <fog attach="fog" args={['#171717', 10, 50]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <OrbitControls target={[0, 0, 0]} />

          <Physics>
            <Car position={[0, 2, 0]} rotation={[0, Math.PI, 0]} />
            <Track />
            <Ground />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}