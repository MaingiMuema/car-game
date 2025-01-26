/// <reference types="@react-three/fiber" />
import { DirectionalLight } from 'three'
import { Object3DNode } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>
  }
}
