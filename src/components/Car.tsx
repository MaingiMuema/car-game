'use client';

import { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Group, Vector3 } from 'three';

interface CarProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

const Car = forwardRef<Group, CarProps>(({ position, rotation }, ref) => {
  const [chassisRef, chassisApi] = useBox<Group>(() => ({
    mass: 1500,
    position,
    rotation,
    args: [2.5, 1, 4.5], // car dimensions
    allowSleep: false,
    linearDamping: 0.5,
    angularDamping: 0.5,
  }));

  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const wheelRotation = useRef(0);
  const steeringAngle = useRef(0);
  const engineForce = useRef(0);

  // Subscribe to movement controls
  const [, get] = useKeyboardControls();

  useFrame((state, delta) => {
    const { forward, backward, left, right } = get();
    const maxSpeed = 50;
    const acceleration = 200;
    const deceleration = 10;
    const maxSteeringAngle = Math.PI / 4;
    const steeringSpeed = 2;

    // Get current velocity
    chassisApi.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));

    // Engine force
    if (forward) {
      engineForce.current = THREE.MathUtils.lerp(engineForce.current, acceleration, 0.1);
    } else if (backward) {
      engineForce.current = THREE.MathUtils.lerp(engineForce.current, -acceleration, 0.1);
    } else {
      engineForce.current = THREE.MathUtils.lerp(engineForce.current, 0, 0.1);
    }

    // Steering
    if (left) {
      steeringAngle.current = THREE.MathUtils.lerp(
        steeringAngle.current,
        maxSteeringAngle,
        delta * steeringSpeed
      );
    } else if (right) {
      steeringAngle.current = THREE.MathUtils.lerp(
        steeringAngle.current,
        -maxSteeringAngle,
        delta * steeringSpeed
      );
    } else {
      steeringAngle.current = THREE.MathUtils.lerp(steeringAngle.current, 0, delta * steeringSpeed);
    }

    // Apply forces
    const forward_direction = new THREE.Vector3(0, 0, 1).applyQuaternion(chassisRef.current!.quaternion);
    chassisApi.applyLocalForce([0, 0, engineForce.current], [0, 0, 0]);

    // Apply steering torque
    chassisApi.applyTorque([0, -steeringAngle.current * velocity.current.length() * 0.5, 0]);

    // Speed limiter
    const currentSpeed = velocity.current.length();
    if (currentSpeed > maxSpeed) {
      const velocityScale = maxSpeed / currentSpeed;
      chassisApi.velocity.set(
        velocity.current.x * velocityScale,
        velocity.current.y,
        velocity.current.z * velocityScale
      );
    }

    // Wheel rotation based on velocity
    wheelRotation.current += velocity.current.length() * 0.1;
  });

  return (
    <group ref={chassisRef}>
      {/* Car body */}
      <group>
        {/* Main body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2.5, 1, 4.5]} />
          <meshStandardMaterial color="#2277ff" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Hood */}
        <mesh castShadow position={[0, 0.8, -1]}>
          <boxGeometry args={[2.2, 0.3, 2]} />
          <meshStandardMaterial color="#2277ff" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Roof */}
        <mesh castShadow position={[0, 1.3, 0.5]}>
          <boxGeometry args={[2, 0.8, 2]} />
          <meshStandardMaterial color="#2277ff" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Windows */}
        <mesh castShadow position={[0, 1.3, 0.5]}>
          <boxGeometry args={[1.9, 0.7, 1.9]} />
          <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* Wheels */}
      <Wheel position={[1.2, -0.2, 1.5]} rotation={[wheelRotation.current, steeringAngle.current, 0]} />
      <Wheel position={[-1.2, -0.2, 1.5]} rotation={[wheelRotation.current, steeringAngle.current, 0]} />
      <Wheel position={[1.2, -0.2, -1.5]} rotation={[wheelRotation.current, 0, 0]} />
      <Wheel position={[-1.2, -0.2, -1.5]} rotation={[wheelRotation.current, 0, 0]} />
    </group>
  );
});

interface WheelProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function Wheel({ position, rotation }: WheelProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wheel hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.41, 16]} />
        <meshStandardMaterial color="#777777" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

Car.displayName = 'Car';
export default Car;
