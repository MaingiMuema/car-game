'use client';

import { usePlane } from '@react-three/cannon';
import { Mesh } from 'three';
import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';

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

  // Load and configure textures
  const [
    roughnessMap,
    normalMap,
  ] = useLoader(TextureLoader, [
    '/textures/ground_roughness.jpg',
    '/textures/ground_normal.jpg',
  ]);

  // Configure texture wrapping and repeat
  [roughnessMap, normalMap].forEach(texture => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(50, 50);
  });

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial
        color="#1a1a1a"
        roughnessMap={roughnessMap}
        normalMap={normalMap}
        normalScale={[0.2, 0.2]}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}
