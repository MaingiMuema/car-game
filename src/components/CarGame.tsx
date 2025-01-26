/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, useGLTF, Environment, Effects, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

interface GameState {
  score: number;
  isPlaying: boolean;
  gameOver: boolean;
  lap: number;
  checkpoint: number;
  raceTime: number;
  bestLapTime: number;
  speed: number;
}

interface Checkpoint {
  position: [number, number, number];
  rotation: [number, number, number];
}

const CHECKPOINTS: Checkpoint[] = [
  { position: [0, 0.5, -8], rotation: [0, 0, 0] },
  { position: [8, 0.5, -8], rotation: [0, Math.PI / 2, 0] },
  { position: [8, 0.5, 8], rotation: [0, Math.PI, 0] },
  { position: [-8, 0.5, 8], rotation: [0, -Math.PI / 2, 0] },
];

const Car = ({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) => {
  const carRef = useRef<THREE.Mesh>(null);
  const [steering, setSteering] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [position, setPosition] = useState(new THREE.Vector3(0, 0.5, 0));
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [engineSound] = useState(() => new Audio('/engine.mp3'));
  const [driftSound] = useState(() => new Audio('/drift.mp3'));
  const lastUpdateTime = useRef(Date.now());
  
  // Particle system for speed effect
  const particles = useRef<THREE.Points>(null);
  const particleCount = 1000;
  const particlePositions = new Float32Array(particleCount * 3);
  
  useEffect(() => {
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = Math.random() * 10 - 5;
      particlePositions[i + 1] = Math.random() * 10;
      particlePositions[i + 2] = Math.random() * 10 - 5;
    }
  }, []);

  const checkCheckpoint = () => {
    const currentCheckpoint = CHECKPOINTS[gameState.checkpoint];
    const distance = new THREE.Vector3(...currentCheckpoint.position).distanceTo(position);
    
    if (distance < 3) {
      if (gameState.checkpoint === CHECKPOINTS.length - 1) {
        // Complete lap
        const lapTime = gameState.raceTime;
        setGameState({
          ...gameState,
          checkpoint: 0,
          lap: gameState.lap + 1,
          bestLapTime: lapTime < gameState.bestLapTime || gameState.bestLapTime === 0 ? lapTime : gameState.bestLapTime,
          raceTime: 0,
        });
      } else {
        setGameState({
          ...gameState,
          checkpoint: gameState.checkpoint + 1,
        });
      }
    }
  };

  useFrame((_, delta) => {
    if (!carRef.current || !gameState.isPlaying) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    // Update race time
    setGameState({
      ...gameState,
      raceTime: gameState.raceTime + deltaTime,
      speed: velocity.length() * 100, // Convert to km/h
    });

    // Enhanced physics
    const enginePower = 15;
    const brakingPower = 20;
    const maxSpeed = 30;
    const drag = 0.95;
    const angularDrag = 0.9;
    const gripFactor = brake > 0 ? 0.7 : 0.95;

    // Calculate forces
    const forward = new THREE.Vector3(
      Math.sin(carRef.current.rotation.y),
      0,
      Math.cos(carRef.current.rotation.y)
    );
    
    // Apply engine force
    const engineForce = forward.multiplyScalar(throttle * enginePower * deltaTime);
    velocity.add(engineForce);

    // Apply braking force
    if (brake > 0) {
      const brakeForce = velocity.clone().multiplyScalar(-brake * brakingPower * deltaTime);
      velocity.add(brakeForce);
    }

    // Apply drag
    velocity.multiplyScalar(drag);

    // Apply grip (lateral friction)
    const forwardVelocity = forward.multiplyScalar(forward.dot(velocity));
    const lateralVelocity = velocity.clone().sub(forwardVelocity);
    lateralVelocity.multiplyScalar(gripFactor);
    velocity.copy(forwardVelocity).add(lateralVelocity);

    // Update position
    const newPosition = position.clone().add(velocity.clone().multiplyScalar(deltaTime));

    // Track boundaries
    const trackBounds = 9;
    if (Math.abs(newPosition.x) > trackBounds || Math.abs(newPosition.z) > trackBounds) {
      velocity.multiplyScalar(-0.5); // Bounce off walls
      driftSound.play();
    } else {
      carRef.current.position.copy(newPosition);
      setPosition(newPosition);
    }

    // Apply steering
    const steeringPower = 2.5 * (1 - Math.min(velocity.length() / maxSpeed, 1) * 0.5);
    carRef.current.rotation.y += steering * steeringPower * deltaTime;

    // Check checkpoints
    checkCheckpoint();
    
    // Update engine sound
    engineSound.volume = Math.min(velocity.length() / maxSpeed, 1) * 0.5;
    engineSound.playbackRate = 1 + velocity.length() / maxSpeed;

    // Update particles
    if (particles.current) {
      particles.current.rotation.y += deltaTime * velocity.length();
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i + 1] -= velocity.length() * 10 * deltaTime;
        if (positions[i + 1] < 0) positions[i + 1] = 10;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
          setThrottle(1);
          break;
        case "ArrowDown":
        case "s":
          setBrake(1);
          break;
        case "ArrowLeft":
        case "a":
          setSteering(1);
          break;
        case "ArrowRight":
        case "d":
          setSteering(-1);
          break;
        case " ": // Handbrake
          setBrake(1);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
          setThrottle(0);
          break;
        case "ArrowDown":
        case "s":
          setBrake(0);
          break;
        case "ArrowLeft":
        case "a":
          setSteering(0);
          break;
        case "ArrowRight":
        case "d":
          setSteering(0);
          break;
        case " ":
          setBrake(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
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
      
      {/* Checkpoints */}
      {CHECKPOINTS.map((checkpoint, i) => (
        <group key={i}>
          <mesh position={checkpoint.position} rotation={checkpoint.rotation}>
            <boxGeometry args={[0.2, 2, 4]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.5} />
          </mesh>
          <Text
            position={[checkpoint.position[0], checkpoint.position[1] + 2, checkpoint.position[2]]}
            rotation={checkpoint.rotation}
            color="#00ff00"
            fontSize={0.5}
          >
            {i + 1}
          </Text>
        </group>
      ))}
    </group>
  );
};

const HUD = ({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <group position={[0, 0, -5]}>
      <Text
        position={[-2, 3, 0]}
        color="#ffffff"
        fontSize={0.3}
        anchorX="left"
      >
        {`Lap: ${gameState.lap + 1}/3\nCheckpoint: ${gameState.checkpoint + 1}/${CHECKPOINTS.length}\nSpeed: ${Math.round(gameState.speed)} km/h\nTime: ${formatTime(gameState.raceTime)}\nBest Lap: ${gameState.bestLapTime > 0 ? formatTime(gameState.bestLapTime) : 'N/A'}`}
      </Text>
      
      {!gameState.isPlaying && (
        <>
          <Text
            position={[0, 0, 0]}
            color="#ffffff"
            fontSize={0.5}
            onClick={() => setGameState({
              score: 0,
              isPlaying: true,
              gameOver: false,
              lap: 0,
              checkpoint: 0,
              raceTime: 0,
              bestLapTime: 0,
              speed: 0
            })}
          >
            {gameState.lap > 0 ? 'Race Complete! Click to Restart' : 'Click to Start'}
          </Text>
          <Text
            position={[0, -1, 0]}
            color="#ffffff"
            fontSize={0.3}
          >
            Controls: WASD or Arrow Keys to drive\nSpacebar for handbrake
          </Text>
        </>
      )}
    </group>
  );
};

const GameScene = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    gameOver: false,
    lap: 0,
    checkpoint: 0,
    raceTime: 0,
    bestLapTime: 0,
    speed: 0
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
