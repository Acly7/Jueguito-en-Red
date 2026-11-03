import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Laberinto from './components/Laberinto'
import Marcador from './components/Marcador'
import MiniMapa from './components/MiniMapa'
import { ROOMS, KEY_COUNT, RUNES, createSimulation, snapshot, formatTime } from './labyrinth'
import './App.css'
const cameraModes = ['Perspectiva · seguimiento', 'Perspectiva · mapa completo', 'Cenital · mapa completo', 'Cenital · seguimiento']
const controls = [
  { name: 'interact', keys: ['KeyE'] },
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] }, { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] }, { name: 'right', keys: ['ArrowRight', 'KeyD'] },
]
class SceneBoundary extends Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? <div className="webgl-error">No se pudo iniciar el 3D. Activa la aceleración gráfica y recarga la página.</div> : this.props.children }
}
export default function App() {
  const simulation = useRef(createSimulation()), touch = useRef({})
  const [status, setStatus] = useState('ready'), [view, setView] = useState(() => snapshot(createSimulation()))
  const [cameraMode, setCameraMode] = useState(0)
  const room = ROOMS[view.room]
  const reset = useCallback(() => {
    simulation.current = createSimulation(); touch.current = {}; setView(snapshot(simulation.current)); setStatus('ready')
  }, [])
  const pause = useCallback(() => { touch.current = {}; setStatus(s => s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s) }, [])
  const onUpdate = useCallback(next => { setView(next); if (next.won) { setStatus('won'); touch.current = {} } }, [])
  useEffect(() => {
    const keydown = e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault()
      if (e.repeat) return
      if (e.code === 'KeyP' || e.code === 'Escape') pause()
      if (e.code === 'KeyR') reset()
      if (e.code === 'KeyV') setCameraMode(v => (v + 1) % cameraModes.length)
    }
    const blur = () => { touch.current = {}; setStatus(s => s === 'playing' ? 'paused' : s) }
    window.addEventListener('keydown', keydown); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('blur', blur) }
  }, [pause, reset])
  return <main className="game" style={{ '--room-color': room.accent }} data-room={view.room} data-cell={view.cell.join(',')}>
    <Marcador deaths={view.deaths} time={view.time} progress={view.won ? 100 : view.keys.length / KEY_COUNT * 100} status={status} onPause={pause} onReset={reset} />
    <aside className="mission">
      <span className="eyebrow">AVENTURA 02 / LOS REINOS</span><h1>El laberinto<br />de la Llamita.</h1>
      <p>Una llama. Seis llaves.<br />El camino de vuelta es parte del desafío.</p>
      <div className="difficulty"><i /> DIFICULTAD EXPERTA <span>III</span></div>
      <div className="section-title">TUS LLAVES <span>{view.keys.length} / {KEY_COUNT}</span></div>
      <div className="inventory">{ROOMS.slice(1).map(r => <div key={r.id} className={view.keys.includes(r.id) ? 'key-slot collected' : 'key-slot'} style={{ '--key-color': r.accent }} aria-label={`Llave ${r.short}: ${view.keys.includes(r.id) ? 'conseguida' : 'pendiente'}`}><span>⚿</span><small>{r.short}</small><b>{view.keys.includes(r.id) ? '✓' : '—'}</b></div>)}</div>
      <div className="section-title">RUTA DE LA EXPEDICIÓN</div>
      <ol className="room-list">{ROOMS.map(r => <li key={r.id} className={r.id === view.room ? 'current' : ''} style={{ '--key-color': r.accent }}><i /><div><strong>{r.short}</strong><small>{r.id === view.room ? 'ESTÁS AQUÍ' : view.visited.includes(r.id) ? 'EXPLORADO' : 'SIN EXPLORAR'}</small></div><span>{r.id === view.room ? '◀' : String(r.id + 1).padStart(2, '0')}</span></li>)}</ol>
      <p className="route-note">Zafiro → Ámbar → Violeta → Jade → Carmesí → Hielo → Santuario</p>
      <div className="rules"><strong>LEE EL PELIGRO</strong><p><i className="enemy-dot" /> Guardianes: no los toques.</p><p><i className="warning-dot" /> Suelo ámbar: va a activarse.</p><p><i className="trap-dot" /> Pinchos rojos: espera.</p><small>Al morir vuelves a A.<br />Las llaves recuperadas se conservan.</small></div>
    </aside>
    <section className="world" aria-label={`Mapa 3D: ${room.name}`}>
      <div className="room-heading"><div><span className="eyebrow">ZONA {String(view.room + 1).padStart(2, '0')} / {String(ROOMS.length).padStart(2, '0')}</span><h2>{room.name}</h2></div><span className="room-badge">{view.room === 0 ? 'ZONA SEGURA' : `${room.enemies.length} GUARDIANES`}</span></div>
      <KeyboardControls map={controls}><div className="scene"><SceneBoundary><Canvas shadows camera={{ position: [6, 12, 15], fov: 52, near: 0.1, far: 220 }} dpr={[1, 1.5]} fallback={<div className="webgl-error">Necesitas un navegador con WebGL.</div>}>
        <Laberinto cameraMode={cameraMode} view={view} simulation={simulation} status={status} onUpdate={onUpdate} touch={touch} />
      </Canvas></SceneBoundary></div></KeyboardControls>
      <label className="camera-toggle">Cámara <select aria-label="Vista de cámara" value={cameraMode} onChange={e => setCameraMode(Number(e.target.value))}>{cameraModes.map((name, i) => <option key={name} value={i}>{name}</option>)}</select><kbd>V</kbd></label>
      <MiniMapa room={room} view={view} />
      {room.puzzle && <div className="puzzle-panel"><strong>{view.puzzle.solved ? '✓ RUNAS RESUELTAS' : 'PISTA DEL SELLO'}</strong><span>{room.puzzle.order.map(i => RUNES[i]).join(' → ')}</span><small>{view.puzzle.solved ? 'Recoge la llave y busca la salida.' : `Acércate y pulsa E · ${view.puzzle.progress}/3`}{view.puzzle.deadline > 0 ? ` · ${Math.max(0, Math.ceil(view.puzzle.deadline - view.time))} s` : room.puzzle.timed && !view.puzzle.solved ? ` · Límite: ${room.puzzle.limit} s desde la primera runa` : ''}</small></div>}
      <div className={`status-note ${view.message.startsWith('¡Te') ? 'hit' : ''}`} role="status">{view.message}</div>
    </section>
    {status !== 'playing' && <div className="overlay"><section className="dialog" role="dialog" aria-labelledby="dialog-title">
      <span className="eyebrow">{status === 'won' ? 'LOS SEIS REINOS CONQUISTADOS' : status === 'paused' ? 'TOMA UN RESPIRO' : 'INSPIRADO EN LOS LABERINTOS CLÁSICOS'}</span>
      <h2 id="dialog-title">{status === 'won' ? '¡La Llamita regresa!' : status === 'paused' ? 'En pausa.' : 'No todos los caminos\nllevan a casa.'}</h2>
      <p>{status === 'won' ? `Tu llama regresó con las seis llaves en ${formatTime(view.time)}. Muertes: ${view.deaths}.` : status === 'paused' ? 'Los guardianes y las trampas están detenidos.' : 'Explora siete zonas en perspectiva 3D. Resuelve las runas, supera los puzles contrarreloj y esquiva 39 guardianes. Recupera seis llaves y vuelve al altar B.'}</p>
      {status === 'ready' && <div className="intro-facts"><span>06 LLAVES</span><span>39 GUARDIANES</span><span>01 LLAMITA</span></div>}
      <button className="primary" onClick={() => { if (status === 'won') reset(); else setStatus('playing') }}>{status === 'won' ? 'Nueva expedición' : status === 'paused' ? 'Continuar expedición' : 'Entrar al laberinto'} <span>↗</span></button>
      {status === 'ready' && <small>WASD / flechas · E interactúa · V cámara · P pausa</small>}
    </section></div>}
    <footer className="footer"><div className="keycaps"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div><p><strong>Muévete con WASD o flechas</strong><span>E · Runas / V · Cámara / P · Pausa / R · Reiniciar</span></p><span className="footer-right">ENCUENTRA LAS LLAVES. RECUERDA EL CAMINO. ↗</span></footer>
    <nav className="touch-controls" aria-label="Controles táctiles">{[['left', '←', 'izquierda'], ['forward', '↑', 'adelante'], ['backward', '↓', 'atrás'], ['right', '→', 'derecha'], ['interact', 'E', 'interactuar']].map(([key, label, name]) => <button key={key} aria-label={`Mover ${name}`} disabled={status !== 'playing'} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); touch.current[key] = true }} onPointerUp={() => { touch.current[key] = false }} onPointerCancel={() => { touch.current[key] = false }} onLostPointerCapture={() => { touch.current[key] = false }}>{label}</button>)}</nav>
  </main>
}
