/* oxlint-disable react/immutability -- Las transformaciones de Three y la simulación son refs mutables de useFrame. */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { stepSimulation, snapshot } from '../labyrinth'

export default function Jugador({ simulation, status, onUpdate, touch }) {
  const model = useRef(), lastUpdate = useRef(-1)
  const [, getKeys] = useKeyboardControls()
  useFrame((_, delta) => {
    const sim = simulation.current
    const keys = getKeys()
    const input = Object.fromEntries(['forward', 'backward', 'left', 'right', 'interact'].map(key => [key, Boolean(keys[key] || touch.current[key])]))
    if (status === 'playing') {
      const before = `${sim.room}/${sim.deaths}/${sim.keys.length}/${sim.won}`
      stepSimulation(sim, input, delta)
      if (sim.time - lastUpdate.current > 0.08 || before !== `${sim.room}/${sim.deaths}/${sim.keys.length}/${sim.won}`) {
        lastUpdate.current = sim.time; onUpdate(snapshot(sim))
      }
      const dx = Number(input.right) - Number(input.left), dz = Number(input.backward) - Number(input.forward)
      if (dx || dz) model.current.rotation.y = Math.atan2(-dx, -dz)
    }
    if (sim.time < lastUpdate.current) lastUpdate.current = -1
    model.current.position.set(sim.position.x, 0.72, sim.position.z)
    // La protección pulsa suavemente; la llama permanece siempre visible.
    model.current.scale.setScalar(sim.time < sim.immunity ? 1 + Math.sin(sim.time * 12) * 0.06 : 1)
  }, -2)
  return <group ref={model} position={[0, 0.72, 0]}>
    <mesh position={[0, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.48, 0.59, 24]} /><meshBasicMaterial color="#62ffe1" /></mesh>
    <mesh castShadow><boxGeometry args={[0.64, 0.7, 0.9]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    <mesh castShadow position={[0, 0.45, -0.36]}><boxGeometry args={[0.37, 0.72, 0.36]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    <mesh castShadow position={[0, 0.85, -0.45]}><boxGeometry args={[0.4, 0.32, 0.52]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    {[-0.12, 0.12].map(x => <mesh key={x} castShadow position={[x, 1.13, -0.37]}><boxGeometry args={[0.09, 0.32, 0.12]} /><meshStandardMaterial color="#fff0cd" /></mesh>)}
    {[-0.23, 0.23].flatMap(x => [-0.28, 0.28].map(z => <mesh key={`${x}-${z}`} castShadow position={[x, -0.5, z]}><boxGeometry args={[0.13, 0.4, 0.16]} /><meshStandardMaterial color="#c6a57a" /></mesh>))}
    <mesh position={[0, 0.27, 0.1]} castShadow><boxGeometry args={[0.72, 0.18, 0.6]} /><meshStandardMaterial color="#11d5b0" /></mesh>
    {[-0.205, 0.205].map(x => <mesh key={x} position={[x, 0.9, -0.54]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#16242d" /></mesh>)}
  </group>
}
