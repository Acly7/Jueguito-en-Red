import { useMemo, useEffect } from 'react'
import { CanvasTexture } from 'three'
import { useThree } from '@react-three/fiber'
import { OBSTACLES, WALLS } from '../game'
import ParedEmergente from './ParedEmergente'
import Jugador from './Jugador'
import Obstaculo from './Obstaculo'
function Zona({ z, color, letter, label }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color; ctx.font = 'bold 86px sans-serif'; ctx.fillText(letter, 8, 95)
    ctx.font = '25px sans-serif'; ctx.fillText(label, 85, 78)
    return new CanvasTexture(canvas)
  }, [color, letter, label])
  useEffect(() => () => texture.dispose(), [texture])
  return <group position={[0, 0.03, z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.65, 48]} /><meshStandardMaterial color={color} transparent opacity={0.65} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[1.6, 1.69, 48]} /><meshBasicMaterial color={color} /></mesh>
    <sprite position={[3.2, 0.65, 0]} scale={[3.5, 1.75, 1]}><spriteMaterial map={texture} transparent depthTest={false} /></sprite>
  </group>
}
export default function Escenario(props) {
  const { camera, size } = useThree()
  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- La cámara Three es un objeto mutable de la escena, no estado React.
    camera.zoom = Math.min(26, size.width / 25, size.height / 25)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  return <>
    <color attach="background" args={['#101f2e']} /><fog attach="fog" args={['#101f2e', 38, 85]} />
    <ambientLight intensity={1.2} /><hemisphereLight args={['#b0e9ff', '#555148', 1.3]} />
    <directionalLight position={[-8, 18, 8]} intensity={2.7} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={0.04} />
    <mesh position={[0, -0.5, 0]} receiveShadow><boxGeometry args={[12, 1, 24]} /><meshStandardMaterial color="#35494b" /></mesh>
    <mesh position={[0, -1.3, 0]}><boxGeometry args={[11.4, 1.4, 23.4]} /><meshStandardMaterial color="#223237" /></mesh>
    {[-5.9, 5.9].map(x => <mesh key={x} position={[x, 0.08, 0]}><boxGeometry args={[0.12, 0.16, 24]} /><meshStandardMaterial color="#72908a" /></mesh>)}
    {OBSTACLES.map(config => <group key={config.id}>
      <mesh position={[0, 0.015, config.z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[11.6, 0.07]} /><meshBasicMaterial color="#d59163" transparent opacity={0.45} /></mesh>
      <Obstaculo config={config} simulation={props.simulation} />
    </group>)}
    {WALLS.map(config => <ParedEmergente key={config.id} config={config} simulation={props.simulation} />)}
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 0.02, 8 - i * 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.06, 0.6]} /><meshBasicMaterial color="#90aaa0" transparent opacity={0.35} /></mesh>)}
    <Zona z={10} color="#39e6bd" letter="A" label="INICIO" /><Zona z={-10} color="#ffd477" letter="B" label="META" />
    {[-1.7, 1.7].map(x => <mesh key={x} position={[x, 1.2, -10]} castShadow><boxGeometry args={[0.15, 2.4, 0.15]} /><meshStandardMaterial color="#ffd477" /></mesh>)}
    <mesh position={[0, 2.4, -10]}><boxGeometry args={[3.55, 0.25, 0.2]} /><meshStandardMaterial color="#ffd477" /></mesh>
    {Array.from({ length: 14 }, (_, i) => {
      const x = (i % 2 === 0 ? -1 : 1) * (12 + (i % 3) * 3), z = Math.floor(i / 2) * 9 - 30, h = 7 + (i % 4) * 3
      return <group key={i} position={[x, -5, z]}><mesh position={[0, h / 2, 0]}><coneGeometry args={[5.5, h, 5]} /><meshStandardMaterial color={i % 2 ? '#233c49' : '#2c4650'} flatShading /></mesh><mesh position={[0, h * 0.88, 0]}><coneGeometry args={[1.4, h * 0.25, 5]} /><meshStandardMaterial color="#819c9e" flatShading /></mesh></group>
    })}
    <Jugador {...props} />
  </>
}
