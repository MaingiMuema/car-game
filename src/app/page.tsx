'use client';

import CarGame from "../components/CarGame";

export default function GamePage() {
  return (
    <div className="relative w-screen h-screen">
      <CarGame />
      
      {/* Game instructions */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Controls</h2>
        <ul className="space-y-1">
          <li>W / ↑ - Accelerate</li>
          <li>S / ↓ - Brake/Reverse</li>
          <li>A / ← - Turn Left</li>
          <li>D / → - Turn Right</li>
        </ul>
      </div>
    </div>
  );
}
