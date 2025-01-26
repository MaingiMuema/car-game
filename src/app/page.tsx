'use client';

import { KeyboardControls } from '@react-three/drei';
import CarGame from "../components/CarGame";

export default function GamePage() {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
      ]}
    >
      <CarGame />
    </KeyboardControls>
  );
}
