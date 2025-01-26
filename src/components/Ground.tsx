'use client';

import { usePlane } from '@react-three/cannon';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Ground() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
    type: 'Static',
    material: {
      friction: 1,
      restitution: 0.2,
    },
  }));

  // Create a grid pattern for the ground
  const gridSize = 100;
  const gridDivisions = 20;

  return (
    <>
      {/* Main ground */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.2}
          roughness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[gridSize, gridSize, gridDivisions, gridDivisions]} />
        <meshStandardMaterial
          color="#333333"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Center marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  );
}
