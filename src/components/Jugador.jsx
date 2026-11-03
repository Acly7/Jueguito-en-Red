/* oxlint-disable react/immutability -- La simulación usa refs mutables en useFrame, fuera del estado de render de React. */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { START, movePlayer, hasCollision, reachedGoal, progressAt } from '../game'

export default function Jugador({ simulation, status, onDeath, onWin, onUpdate, touch }) {
  const model = useRef()
  const jumpHeld = useRef(false)
  const [, getKeys] = useKeyboardControls()
  useFrame((_, frameDelta) => {
    const sim = simulation.current
    if (status === 'playing') {
      // Subpasos para no atravesar obstáculos cuando baja la tasa de cuadros.
      let remaining = Math.min(frameDelta, 0.1)
      const keys = getKeys()
      const input = Object.fromEntries(['forward', 'backward', 'left', 'right', 'jump'].map(key => [key, Boolean(keys[key] || touch.current[key])]))
      const startJump = input.jump && !jumpHeld.current
      jumpHeld.current = input.jump
      while (remaining > 0) {
        const delta = Math.min(remaining, 1 / 120)
        remaining -= delta
        sim.time += delta
        if (startJump && sim.jumpY <= 0 && sim.jumpV <= 0) sim.jumpV = 8
        sim.jumpY = Math.max(0, sim.jumpY + sim.jumpV * delta)
        sim.jumpV = sim.jumpY === 0 ? 0 : sim.jumpV - 13 * delta
        sim.position = movePlayer(sim.position, input, delta)
        if (hasCollision(sim.position, sim.time, sim.jumpY)) { sim.position = { ...START }; sim.jumpY = 0; sim.jumpV = 0; onDeath(); break }
        if (reachedGoal(sim.position)) { onWin(sim.time); break }
      }
      if (sim.time - sim.lastUpdate > 0.08) { sim.lastUpdate = sim.time; onUpdate(sim.time, reachedGoal(sim.position) ? 100 : progressAt(sim.position)) }
      const dx = Number(input.right) - Number(input.left)
      const dz = Number(input.backward) - Number(input.forward)
      if (dx || dz) model.current.rotation.y = Math.atan2(-dx, -dz)
    }
    model.current.position.set(sim.position.x, 0.72 + sim.jumpY, sim.position.z)
  }, -2)
  return <group ref={model} position={[0, 0.72, 10]}>
    <mesh castShadow><boxGeometry args={[0.64, 0.7, 0.9]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    <mesh castShadow position={[0, 0.45, -0.36]}><boxGeometry args={[0.37, 0.72, 0.36]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    <mesh castShadow position={[0, 0.85, -0.45]}><boxGeometry args={[0.4, 0.32, 0.52]} /><meshStandardMaterial color="#fff0cd" /></mesh>
    {[-0.12, 0.12].map(x => <mesh key={x} castShadow position={[x, 1.13, -0.37]}><boxGeometry args={[0.09, 0.32, 0.12]} /><meshStandardMaterial color="#fff0cd" /></mesh>)}
    {[-0.23, 0.23].flatMap(x => [-0.28, 0.28].map(z => <mesh key={`${x}-${z}`} castShadow position={[x, -0.5, z]}><boxGeometry args={[0.13, 0.4, 0.16]} /><meshStandardMaterial color="#c6a57a" /></mesh>))}
    <mesh position={[0, 0.27, 0.1]} castShadow><boxGeometry args={[0.72, 0.18, 0.6]} /><meshStandardMaterial color="#11d5b0" /></mesh>
    {[-0.205, 0.205].map(x => <mesh key={x} position={[x, 0.9, -0.54]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#16242d" /></mesh>)}
  </group>
}
