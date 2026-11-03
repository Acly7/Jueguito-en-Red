/* oxlint-disable react/immutability -- Cámara y meshes de Three se actualizan mediante su API mutable. */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, Vector3 } from 'three'
import { ROOMS, KEY_COUNT, RUNES, TILE, world, trapState } from '../labyrinth'
import Jugador from './Jugador'
import Obstaculo from './Obstaculo'

function Label({ text, position, color = '#ffffff', width = 4 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#10161ee8'; ctx.fillRect(0, 12, 512, 104)
    ctx.font = 'bold 45px monospace'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, 256, 81)
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map
  }, [text, color])
  useEffect(() => () => texture.dispose(), [texture])
  return <sprite position={position} scale={[width, width / 4, 1]}><spriteMaterial map={texture} transparent depthTest={false} /></sprite>
}
function Trap({ trap, simulation }) {
  const group = useRef(), material = useRef()
  const p = world(trap.cell)
  useFrame(() => {
    const state = trapState(trap, simulation.current.time)
    group.current.scale.y = state === 'active' ? 1 : 0.06
    material.current.color.set(state === 'active' ? '#ff4e6a' : state === 'warning' ? '#ffc96b' : '#576879')
    material.current.emissive.set(state === 'active' ? '#c91c38' : state === 'warning' ? '#be791b' : '#000000')
  })
  return <group position={[p.x, 0.04, p.z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.7, 1.7]} /><meshStandardMaterial ref={material} color="#576879" /></mesh>
    <group ref={group}>{[-0.45, 0, 0.45].flatMap(x => [-0.45, 0, 0.45].map(z => <mesh key={`${x},${z}`} position={[x, 0.48, z]} castShadow><coneGeometry args={[0.17, 0.95, 4]} /><meshStandardMaterial color="#ff5777" metalness={0.3} roughness={0.45} /></mesh>))}</group>
  </group>
}
function KeyItem({ cell, color, simulation }) {
  const ref = useRef(), p = world(cell)
  useFrame(() => { ref.current.rotation.y = 0.3 + Math.sin(simulation.current.time * 1.8) * 0.45; ref.current.position.y = 1.15 + Math.sin(simulation.current.time * 3) * 0.18 })
  return <group position={[p.x, 1.15, p.z]} ref={ref}>
    <mesh><torusGeometry args={[0.33, 0.1, 8, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, -0.58, 0]}><boxGeometry args={[0.15, 0.75, 0.15]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} /></mesh>
    {[0, 1].map(n => <mesh key={n} position={[0.16, -0.65 - n * 0.22, 0]}><boxGeometry args={[0.35, 0.13, 0.15]} /><meshStandardMaterial color={color} /></mesh>)}
  </group>
}
function Portal({ portal, keys }) {
  const p = world(portal.cell), locked = portal.requires && !keys.includes(portal.requires)
  return <group position={[p.x, 0, p.z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}><circleGeometry args={[0.85, 24]} /><meshBasicMaterial color={portal.color} transparent opacity={0.55} /></mesh>
    {[-0.85, 0.85].map(x => <mesh key={x} position={[x, 1.2, 0]} castShadow><boxGeometry args={[0.22, 2.4, 0.3]} /><meshStandardMaterial color={portal.color} emissive={portal.color} emissiveIntensity={0.2} /></mesh>)}
    <mesh position={[0, 2.4, 0]}><boxGeometry args={[1.95, 0.26, 0.35]} /><meshStandardMaterial color={portal.color} /></mesh>
    {locked && [-0.5, 0, 0.5].map(x => <mesh key={x} position={[x, 1.15, 0]}><boxGeometry args={[0.08, 2.2, 0.08]} /><meshStandardMaterial color="#ddd2ad" metalness={0.6} roughness={0.3} /></mesh>)}
    <Label text={locked ? 'BUSCA LA LLAVE' : portal.label} color={portal.color} position={[0, 3.4, 0]} width={4.8} />
  </group>
}
export default function Laberinto({ view, cameraMode: mode, ...props }) {
  const room = ROOMS[view.room], { camera, size } = useThree()
  const cameraRoom = useRef(-1), cameraMode = useRef(null)
  const aim = useMemo(() => new Vector3(), [])
  const desired = useMemo(() => new Vector3(), [])
  useFrame((_, dt) => {
    const sim = props.simulation.current, p = sim.position
    const aspect = size.width / size.height
    const topDown = mode === 2 || mode === 3
    camera.up.set(0, topDown ? 0 : 1, topDown ? -1 : 0)
    if (topDown) {
      const halfFov = camera.fov * Math.PI / 360
      const fullHeight = Math.max(room.height * TILE, room.width * TILE / aspect) / (2 * Math.tan(halfFov)) * 1.12
      desired.set(mode === 2 ? 0 : p.x, mode === 2 ? fullHeight : (aspect < 0.85 ? 27 : 22), mode === 2 ? 0 : p.z)
    } else if (mode === 1) {
      const distance = Math.max(room.width * TILE / aspect, room.height * TILE) * 1.35
      desired.set(distance * 0.35, distance * 0.85, distance * 0.85)
      aim.set(0, 0, 0)
    } else {
      const factor = aspect < 0.85 ? 1.22 : 1
      desired.set(p.x + 6 * factor, 12 * factor, p.z + 15 * factor)
      aim.set(p.x, 0.65, p.z - 1)
    }
    const snap = cameraRoom.current !== sim.room || cameraMode.current !== mode || sim.time === 0
    camera.position.lerp(desired, snap ? 1 : 1 - Math.exp(-9 * dt))
    if (topDown) aim.set(camera.position.x, 0, camera.position.z)
    camera.lookAt(aim)
    cameraRoom.current = sim.room; cameraMode.current = mode
  }, -0.5)
  const walls = useMemo(() => {
    const runs = []
    room.grid.forEach((row, z) => {
      for (let x = 0; x < row.length; x++) if (row[x]) {
        const start = x; while (x + 1 < row.length && row[x + 1]) x++
        runs.push({ x: (world([start, z]).x + world([x, z]).x) / 2, z: world([x, z]).z, width: (x - start + 1) * TILE })
      }
    })
    return runs
  }, [room])
  return <>
    <color attach="background" args={['#11151e']} />
    <fog attach="fog" args={['#11151e', 65, 150]} />
    <ambientLight intensity={0.85} /><hemisphereLight args={['#dfedff', '#354052', 1.1]} />
    <directionalLight position={[-12, 30, 12]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-26} shadow-camera-right={26} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-normalBias={0.04} />
    <group key={room.id}>
      <mesh position={[0, -0.45, 0]} receiveShadow><boxGeometry args={[room.width * TILE, 0.9, room.height * TILE]} /><meshStandardMaterial color="#252b38" /></mesh>
      {Array.from({ length: room.width + 1 }, (_, i) => <mesh key={`x${i}`} position={[(i - room.width / 2) * TILE, 0.012, 0]}><boxGeometry args={[0.025, 0.01, room.height * TILE]} /><meshBasicMaterial color="#353e4f" /></mesh>)}
      {Array.from({ length: room.height + 1 }, (_, i) => <mesh key={`z${i}`} position={[0, 0.012, (i - room.height / 2) * TILE]}><boxGeometry args={[room.width * TILE, 0.01, 0.025]} /><meshBasicMaterial color="#353e4f" /></mesh>)}
      {walls.map((w, i) => <group key={i} position={[w.x, 0, w.z]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow><boxGeometry args={[w.width - 0.035, 1.6, TILE - 0.035]} /><meshStandardMaterial color={room.color} roughness={0.85} /></mesh>
        <mesh position={[0, 1.61, 0]}><boxGeometry args={[w.width - 0.12, 0.06, TILE - 0.12]} /><meshStandardMaterial color={room.accent} roughness={0.9} /></mesh>
      </group>)}
      {room.portals.map((portal, i) => <Portal key={i} portal={portal} keys={view.keys} />)}
      {room.keyCell && view.puzzle.solved && !view.keys.includes(room.id) && <KeyItem cell={room.keyCell} color={room.accent} simulation={props.simulation} />}
      {room.puzzle && <>
        {room.puzzle.cells.map((cell, i) => {
          const p = world(cell), activated = view.puzzle.solved || room.puzzle.order.slice(0, view.puzzle.progress).includes(i)
          return <group key={i} position={[p.x, 0, p.z]}>
            <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.55, 0.7, 0.5, 6]} /><meshStandardMaterial color={activated ? '#73ffd0' : '#56697e'} emissive={activated ? '#29bc8f' : '#000000'} emissiveIntensity={0.5} /></mesh>
            <mesh position={[0, 1, 0]}><octahedronGeometry args={[0.34]} /><meshStandardMaterial color={activated ? '#73ffd0' : '#ffdd8c'} emissive="#b47c20" emissiveIntensity={0.3} /></mesh>
            <Label text={RUNES[i]} position={[0, 2.1, 0]} width={2.8} color={activated ? '#73ffd0' : '#ffdd8c'} />
          </group>
        })}
        {!view.puzzle.solved && <group position={[world(room.keyCell).x, 0, world(room.keyCell).z]}>
          {[-0.6, 0.6].flatMap(x => [-0.6, 0.6].map(z => <mesh key={`${x},${z}`} position={[x, 0.9, z]}><boxGeometry args={[0.1, 1.8, 0.1]} /><meshStandardMaterial color="#91a7b9" metalness={0.7} roughness={0.25} /></mesh>))}
          <mesh position={[0, 1.8, 0]}><boxGeometry args={[1.5, 0.15, 1.5]} /><meshStandardMaterial color="#91a7b9" /></mesh>
          <Label text="SELLO DE RUNAS" position={[0, 2.8, 0]} width={3.5} color={room.accent} />
        </group>}
      </>}
      {room.enemies.map(enemy => <Obstaculo key={enemy.id} enemy={enemy} simulation={props.simulation} color={room.id === 3 ? '#ff4d88' : '#f17b57'} />)}
      {room.traps.map((trap, i) => <Trap key={i} trap={trap} simulation={props.simulation} />)}
      {room.id === 0 && <>
        <mesh position={[0, 0.12, world([9, 5]).z]}><cylinderGeometry args={[1.35, 1.55, 0.24, 8]} /><meshStandardMaterial color={view.keys.length === KEY_COUNT ? '#ffdf7d' : '#71634c'} emissive="#eeb443" emissiveIntensity={view.keys.length === KEY_COUNT ? 0.6 : 0} /></mesh>
        <Label text={view.keys.length === KEY_COUNT ? 'B · REGRESA AQUÍ' : 'B · SEIS LLAVES'} position={[0, 2.6, world([9, 5]).z]} color="#ffdf7d" width={5.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, world(room.start).z]}><ringGeometry args={[0.85, 1.05, 24]} /><meshBasicMaterial color="#8fe9bc" /></mesh>
        <Label text="A · INICIO" position={[0, 2.5, world(room.start).z]} color="#bceba5" />
      </>}
    </group>
    <Jugador {...props} />
  </>
}
