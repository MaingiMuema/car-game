'use client';

import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, Float32BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { usePlane } from '@react-three/cannon';
import { Group } from 'three';
import { Line as ThreeLine } from '@react-three/drei';

export default function Track() {
  const [ref] = usePlane<Group>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  // Create track shape using vertices
  const trackPoints = useMemo(() => {
    const points = new Array(50).fill(0).map((_, i) => {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 20 + Math.sin(angle * 3) * 5;
      return new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    });
    // Close the loop
    points.push(points[0]);
    return points;
  }, []);

  return (
    <group ref={ref}>
      {/* Track surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#303030" />
      </mesh>

      {/* Track outline */}
      <ThreeLine
        points={trackPoints}
        color="white"
        lineWidth={2}
      />
    </group>
  );
}
