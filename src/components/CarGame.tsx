/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, useGLTF, Environment, Effects, Stars } from "@react-three/drei";
import * as THREE from "three";

interface GameState {
  score: number;
  isPlaying: boolean;
  gameOver: boolean;
}

const Car = ({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) => {
  const carRef = useRef<THREE.Mesh>(null);
  const [speed, setSpeed] = useState(0);
  const [steering, setSteering] = useState(0);
  const [position, setPosition] = useState(new THREE.Vector3(0, 0.5, 0));
  const [engineSound] = useState(() => new Audio('/engine.mp3'));
  const [driftSound] = useState(() => new Audio('/drift.mp3'));
  
  // Particle system for speed effect
  const particles = useRef<THREE.Points>(null);
  const particleCount = 1000;
  const particlePositions = new Float32Array(particleCount * 3);
  
  useEffect(() => {
    // Initialize particle positions
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = Math.random() * 10 - 5;
      particlePositions[i + 1] = Math.random() * 10;
      particlePositions[i + 2] = Math.random() * 10 - 5;
    }
  }, []);

  useFrame((_, delta) => {
    if (!carRef.current || !gameState.isPlaying) return;

    // Enhanced physics
    const maxSpeed = 0.2;
    const acceleration = 0.015;
    const friction = 0.985;
    const maxSteering = 0.08;
    const driftFactor = Math.abs(speed) > 0.1 ? 1.2 : 1;

    // Update position with drift physics
    const newPosition = position.clone();
    const direction = new THREE.Vector3(
      Math.sin(carRef.current.rotation.y) * driftFactor,
      0,
      Math.cos(carRef.current.rotation.y)
    );
    newPosition.add(direction.multiplyScalar(speed));

    // Collision detection with track boundaries
    if (Math.abs(newPosition.x) > 9 || Math.abs(newPosition.z) > 9) {
      setSpeed(speed * -0.5); // Bounce off walls
      driftSound.play();
    } else {
      carRef.current.position.copy(newPosition);
      setPosition(newPosition);
    }

    // Update score based on speed
    if (Math.abs(speed) > 0.05) {
      setGameState({
        ...gameState,
        score: gameState.score + Math.floor(Math.abs(speed) * 100)
      });
    }

    // Apply steering with drift
    carRef.current.rotation.y += steering * delta * (2 + Math.abs(speed));
    
    // Update engine sound
    engineSound.volume = Math.min(Math.abs(speed) / maxSpeed, 1);
    engineSound.playbackRate = 1 + Math.abs(speed);

    // Update particles
    if (particles.current) {
      particles.current.rotation.y += delta * speed * 2;
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i + 1] -= speed * 10;
        if (positions[i + 1] < 0) positions[i + 1] = 10;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }

    // Apply physics
    setSpeed((prev) => Math.max(-maxSpeed, Math.min(maxSpeed, prev * friction)));
    setSteering((prev) => prev * 0.9);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case "ArrowUp":
          setSpeed((prev) => prev + 0.015);
          break;
        case "ArrowDown":
          setSpeed((prev) => prev - 0.015);
          break;
        case "ArrowLeft":
          setSteering((prev) => prev + 0.03);
          break;
        case "ArrowRight":
          setSteering((prev) => prev - 0.03);
          break;
        case " ": // Spacebar for handbrake
          setSpeed((prev) => prev * 0.8);
          driftSound.play();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isPlaying]);

  return (
    <group>
      <mesh ref={carRef} position={position} castShadow>
        <boxGeometry args={[0.6, 0.3, 1.2]} />
        <meshStandardMaterial color="#ff3e00" metalness={0.8} roughness={0.4} />
        
        {/* Enhanced car body details */}
        <mesh position={[0, 0.2, -0.2]}>
          <boxGeometry args={[0.55, 0.2, 0.6]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Wheels with suspension effect */}
        {([
          [-0.35, -0.15, 0.45],
          [0.35, -0.15, 0.45],
          [-0.35, -0.15, -0.45],
          [0.35, -0.15, -0.45]
        ] as [number, number, number][]).map((pos, i) => (
          <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
            <meshStandardMaterial color="#111" metalness={0.8} />
          </mesh>
        ))}
        
        {/* Headlights */}
        <pointLight position={[0.25, 0, 0.6]} intensity={0.5} color="#fff" />
        <pointLight position={[-0.25, 0, 0.6]} intensity={0.5} color="#fff" />
      </mesh>
      
      {/* Speed particles */}
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#fff" transparent opacity={0.4} />
      </points>
    </group>
  );
};

const Track = () => {
  return (
    <group>
      {/* Main track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      
      {/* Track boundaries */}
      {([
        [-10, 0.5, 0],
        [10, 0.5, 0],
        [0, 0.5, -10],
        [0, 0.5, 10]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, i < 2 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[20, 1, 0.5]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} />
        </mesh>
      ))}
      
      {/* Obstacles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI * 0.4) * 5,
            0.5,
            Math.cos(i * Math.PI * 0.4) * 5
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const HUD = ({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) => {
  return (
    <group position={[0, 0, -5]}>
      <Text
        position={[-2, 3, 0]}
        color="#ffffff"
        fontSize={0.5}
        anchorX="left"
      >
        {`Score: ${gameState.score}`}
      </Text>
      
      {!gameState.isPlaying && (
        <Text
          position={[0, 0, 0]}
          color="#ffffff"
          fontSize={0.5}
          onClick={() => setGameState({ ...gameState, isPlaying: true, score: 0 })}
        >
          {gameState.score > 0 ? 'Game Over - Click to Restart' : 'Click to Start'}
        </Text>
      )}
    </group>
  );
};

const GameScene = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    gameOver: false
  });

  return (
    <>
      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <Track />
      <Car gameState={gameState} setGameState={setGameState} />
      <HUD gameState={gameState} setGameState={setGameState} />
      
      <OrbitControls
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
};

const CarGame = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <GameScene />
      </Canvas>
    </div>
  );
};

export default CarGame;
