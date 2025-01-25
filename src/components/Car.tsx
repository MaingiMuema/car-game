import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, PerspectiveCamera } from '@react-three/drei';
import { Mesh, Vector3, Group } from 'three';
import { useControls } from './Controls';

export function Car() {
  const carRef = useRef<Mesh>(null);
  const controls = useControls();
  const velocity = useRef<Vector3>(new Vector3());
  const speed = 0.1;
  const rotationSpeed = 0.02;

  useFrame(() => {
    if (!carRef.current) return;

    // Update velocity based on controls
    if (controls.current.forward) {
      velocity.current.z -= speed;
    }
    if (controls.current.backward) {
      velocity.current.z += speed;
    }
    if (controls.current.left) {
      carRef.current.rotation.y += rotationSpeed;
    }
    if (controls.current.right) {
      carRef.current.rotation.y -= rotationSpeed;
    }

    // Apply velocity
    carRef.current.position.add(
      velocity.current.applyAxisAngle(new Vector3(0, 1, 0), carRef.current.rotation.y)
    );

    // Apply friction
    velocity.current.multiplyScalar(0.95);
  });

  return (
    <Group>
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 10]}
        rotation={[-0.5, 0, 0]}
      />
      <Box
        ref={carRef}
        args={[1, 0.5, 2]} // width, height, depth
        position={[0, 0.25, 0]}
      >
        <MeshStandardMaterial color="red" />
      </Box>
    </Group>
  );
}
