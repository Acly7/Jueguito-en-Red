import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { enemyPosition } from '../labyrinth'
export default function Obstaculo({ enemy, simulation, color }) {
  const group = useRef()
  useFrame(() => {
    const p = enemyPosition(enemy, simulation.current.time)
    group.current.position.set(p.x, 0.75 + Math.sin(simulation.current.time * 4) * 0.08, p.z)
  }, -1)
  return <group ref={group}>
    <mesh castShadow><octahedronGeometry args={[0.7]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} flatShading /></mesh>
    {[-0.23, 0.23].map(x => <mesh key={x} position={[x, 0.12, 0.46]}><boxGeometry args={[0.13, 0.16, 0.12]} /><meshBasicMaterial color="#fff4dd" /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}><ringGeometry args={[0.66, 0.75, 24]} /><meshBasicMaterial color={color} /></mesh>
  </group>
}
