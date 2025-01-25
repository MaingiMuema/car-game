import { useEffect, useRef } from 'react';

interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export const useControls = () => {
  const controls = useRef<Controls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          controls.current.forward = true;
          break;
        case 's':
          controls.current.backward = true;
          break;
        case 'a':
          controls.current.left = true;
          break;
        case 'd':
          controls.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          controls.current.forward = false;
          break;
        case 's':
          controls.current.backward = false;
          break;
        case 'a':
          controls.current.left = false;
          break;
        case 'd':
          controls.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
};
