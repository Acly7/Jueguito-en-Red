import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { obstacleX } from '../game'
export default function Obstaculo({ config, simulation }) {
  const rock = useRef()
  useFrame(() => {
    const time = simulation.current.time
    rock.current.position.x = obstacleX(config, time)
    rock.current.rotation.z = -time * config.speed
    rock.current.rotation.x = time * 0.4
  }, -1)
  return <mesh ref={rock} castShadow position={[obstacleX(config, 0), config.radius, config.z]}><icosahedronGeometry args={[config.radius, 1]} /><meshStandardMaterial color="#ff8855" roughness={0.75} flatShading /></mesh>
}
