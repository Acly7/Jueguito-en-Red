import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { wallHeight, wallWarning } from '../game'

export default function ParedEmergente({ config, simulation }) {
  const wall = useRef()
  const warning = useRef()
  useFrame(() => {
    const time = simulation.current.time
    const height = wallHeight(config, time)
    wall.current.position.y = height / 2 - 0.02
    wall.current.scale.y = Math.max(0.001, height)
    wall.current.visible = height > 0.02
    warning.current.material.opacity = wallWarning(config, time) ? 0.8 : 0.22
  })
  return <group>
    <mesh ref={warning} position={[config.x, 0.035, config.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[config.width, 0.75]} />
      <meshBasicMaterial color="#ffcf65" transparent opacity={0.22} depthWrite={false} />
    </mesh>
    <mesh ref={wall} position={[config.x, -0.02, config.z]} castShadow receiveShadow>
      <boxGeometry args={[config.width, 1, 0.4]} />
      <meshStandardMaterial color="#ed796c" roughness={0.8} />
    </mesh>
  </group>
}
