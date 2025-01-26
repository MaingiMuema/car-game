'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Environment, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Suspense, useState, useRef } from 'react';
import Car from './Car';
import Track from './Track';
import Ground from './Ground';
import { Group } from 'three';

export default function CarGame() {
  const [cameraPosition] = useState<[number, number, number]>([0, 15, 25]);
  const carRef = useRef<Group>(null);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}>
      <Canvas shadows camera={{ position: [0, 15, 25], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Environment */}
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />
          
          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          {/* Camera */}
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <OrbitControls 
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2}
            minDistance={10}
            maxDistance={50}
          />

          {/* Game Elements */}
          <Physics
            defaultContactMaterial={{
              friction: 0.7,
              restitution: 0.3,
            }}
            gravity={[0, -9.81, 0]}
          >
            <Car ref={carRef} position={[0, 3, 0]} rotation={[0, Math.PI, 0]} />
            <Track />
            <Ground />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}