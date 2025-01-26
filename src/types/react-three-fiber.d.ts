/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: ThreeElements["mesh"];
      boxGeometry: ReactThreeElements["boxGeometry"];
      sphereGeometry: ReactThreeElements["sphereGeometry"];
      planeGeometry: ReactThreeElements["planeGeometry"];
      meshStandardMaterial: ReactThreeElements["meshStandardMaterial"];
    }
  }
}
