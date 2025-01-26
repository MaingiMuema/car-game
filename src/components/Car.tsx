'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Group, Vector3 } from 'three';

interface CarProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function Car({ position, rotation }: CarProps) {
  const [ref, api] = useBox<Group>(() => ({
    mass: 500,
    position,
    rotation,
    args: [2, 1, 4], // car dimensions
    allowSleep: false,
  }));

  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const wheelRotation = useRef(0);

  // Subscribe to movement controls
  const [, get] = useKeyboardControls();

  useFrame(() => {
    const { forward, backward, left, right } = get();
    const speed = 50;
    const rotationSpeed = 0.05;
    const maxVelocity = 30;

    // Get current velocity
    api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));

    // Forward and backward movement
    if (forward) {
      api.applyImpulse([0, 0, -speed], [0, 0, 0]);
    }
    if (backward) {
      api.applyImpulse([0, 0, speed], [0, 0, 0]);
    }

    // Left and right rotation
    if (left) {
      api.applyTorque([0, rotationSpeed, 0]);
    }
    if (right) {
      api.applyTorque([0, -rotationSpeed, 0]);
    }

    // Apply drag force
    const drag = 0.95;
    api.velocity.set(
      velocity.current.x * drag,
      velocity.current.y,
      velocity.current.z * drag
    );

    // Limit maximum velocity
    if (Math.abs(velocity.current.z) > maxVelocity) {
      api.velocity.set(
        velocity.current.x,
        velocity.current.y,
        Math.sign(velocity.current.z) * maxVelocity
      );
    }

    // Rotate wheels based on movement
    wheelRotation.current += velocity.current.z * 0.1;
  });

  return (
    <group ref={ref}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Wheels */}
      <Wheel position={[1, -0.5, 1]} rotation={wheelRotation.current} />
      <Wheel position={[-1, -0.5, 1]} rotation={wheelRotation.current} />
      <Wheel position={[1, -0.5, -1]} rotation={wheelRotation.current} />
      <Wheel position={[-1, -0.5, -1]} rotation={wheelRotation.current} />
    </group>
  );
}

interface WheelProps {
  position: [number, number, number];
  rotation: number;
}

function Wheel({ position, rotation }: WheelProps) {
  return (
    <mesh position={position} rotation={[rotation, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}
