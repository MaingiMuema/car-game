import { DirectionalLight, AmbientLight, Group, MeshStandardMaterial } from 'three';
import { Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
    ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
    group: Object3DNode<Group, typeof Group>;
    meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>
    }
  }
}

extend({ DirectionalLight });
