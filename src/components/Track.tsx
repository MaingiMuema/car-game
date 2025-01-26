'use client';

import { useMemo } from 'react';
import { Vector3, Shape, ExtrudeGeometry, Mesh } from 'three';
import { usePlane, useBox } from '@react-three/cannon';
import { Group } from 'three';

export default function Track() {
  const [ref] = usePlane<Group>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  // Create track shape using spline points
  const trackPoints = useMemo(() => {
    const points: Vector3[] = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const radius = 20 + Math.sin(angle * 3) * 5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new Vector3(x, 0, z));
    }
    return points;
  }, []);

  // Create track geometry
  const trackGeometry = useMemo(() => {
    const shape = new Shape();
    const trackWidth = 8;
    
    // Create a path for the track
    trackPoints.forEach((point, i) => {
      if (i === 0) {
        shape.moveTo(point.x, point.z);
      } else {
        shape.lineTo(point.x, point.z);
      }
    });
    
    // Close the path
    shape.closePath();

    // Create extruded geometry
    return new ExtrudeGeometry(shape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3
    });
  }, [trackPoints]);

  // Create barriers
  const Barrier = ({ position }: { position: [number, number, number] }) => {
    const [barrierRef] = useBox<Mesh>(() => ({
      mass: 0,
      position,
      args: [2, 1, 0.5],
      type: 'Static',
    }));

    return (
      <mesh ref={barrierRef} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial color="#ff4444" metalness={0.6} roughness={0.4} />
      </mesh>
    );
  };

  // Place barriers around the track
  const barriers = useMemo(() => {
    return trackPoints.map((point, i) => {
      const nextPoint = trackPoints[(i + 1) % trackPoints.length];
      const direction = nextPoint.clone().sub(point).normalize();
      const normal = new Vector3(-direction.z, 0, direction.x);
      
      // Place barriers on both sides of the track
      const leftPosition: [number, number, number] = [
        point.x + normal.x * 6,
        0.5,
        point.z + normal.z * 6
      ];
      const rightPosition: [number, number, number] = [
        point.x - normal.x * 6,
        0.5,
        point.z - normal.z * 6
      ];

      return (
        <group key={i}>
          <Barrier position={leftPosition} />
          <Barrier position={rightPosition} />
        </group>
      );
    });
  }, [trackPoints]);

  return (
    <group ref={ref}>
      {/* Track surface */}
      <mesh geometry={trackGeometry} receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#444444" 
          metalness={0.8}
          roughness={0.3}
          envMapIntensity={1}
        />
      </mesh>

      {/* Track markings */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#333333"
          metalness={0.2}
          roughness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Barriers */}
      {barriers}
    </group>
  );
}
