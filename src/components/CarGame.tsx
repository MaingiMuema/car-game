/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const Car = () => {
  const carRef = useRef<THREE.Mesh>(null);
  const [speed, setSpeed] = useState(0);
  const [steering, setSteering] = useState(0);
  const [position, setPosition] = useState(new THREE.Vector3(0, 0.5, 0));

  useFrame((_, delta) => {
    if (!carRef.current) return;

    // Basic physics
    const maxSpeed = 0.1;
    const acceleration = 0.01;
    const friction = 0.98;
    const maxSteering = 0.05;

    // Update position
    const newPosition = position.clone();
    newPosition.z += speed * Math.cos(carRef.current.rotation.y);
    newPosition.x += speed * Math.sin(carRef.current.rotation.y);

    // Apply steering
    carRef.current.rotation.y += steering * delta * 2;
    carRef.current.position.copy(newPosition);

    // Apply friction
    setSpeed((prev) =>
      Math.max(-maxSpeed, Math.min(maxSpeed, prev * friction))
    );
    setSteering((prev) => prev * 0.9);
    setPosition(newPosition);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setSpeed((prev) => prev + 0.01);
          break;
        case "ArrowDown":
          setSpeed((prev) => prev - 0.01);
          break;
        case "ArrowLeft":
          setSteering((prev) => prev + 0.02);
          break;
        case "ArrowRight":
          setSteering((prev) => prev - 0.02);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <mesh ref={carRef} position={position}>
      <boxGeometry args={[0.5, 0.3, 1]} />
      <meshStandardMaterial color="red" />
      {/* Wheels */}
      <mesh position={[0.3, -0.15, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.3, -0.15, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.3, -0.15, -0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.3, -0.15, -0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </mesh>
  );
};

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  );
};

const GameScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Ground />
      <Car />
      <OrbitControls />
      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Use arrow keys to drive!
      </Text>
    </>
  );
};

export const CarGame = () => {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <GameScene />
      </Canvas>
    </div>
  );
};
