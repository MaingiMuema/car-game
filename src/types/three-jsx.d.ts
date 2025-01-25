import { MeshStandardMaterial, AmbientLight, DirectionalLight } from 'three';
import { Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    group: Object3DNode<THREE.Group, typeof THREE.Group>;
    meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof MeshStandardMaterial>;
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
  }
}
