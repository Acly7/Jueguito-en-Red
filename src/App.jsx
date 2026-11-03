import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Escenario from './components/Escenario'
import Marcador from './components/Marcador'
import { START, formatTime } from './game'
import './App.css'
const controls = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] }, { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] }, { name: 'right', keys: ['ArrowRight', 'KeyD'] },
]
const initialSimulation = () => ({ position: { ...START }, time: 0, lastUpdate: 0, jumpY: 0, jumpV: 0 })
class SceneBoundary extends Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? <div className="webgl-error">No se pudo iniciar el 3D. Activa la aceleración gráfica del navegador y recarga la página.</div> : this.props.children }
}
export default function App() {
  const [status, setStatus] = useState('ready'), [deaths, setDeaths] = useState(0), [time, setTime] = useState(0), [progress, setProgress] = useState(0), [hit, setHit] = useState(false)
  const simulation = useRef(initialSimulation()), touch = useRef({}), hitTimer = useRef()
  const reset = useCallback(() => {
    simulation.current = initialSimulation(); touch.current = {}; clearTimeout(hitTimer.current)
    setDeaths(0); setTime(0); setProgress(0); setHit(false); setStatus('ready')
  }, [])
  const pause = useCallback(() => { touch.current = {}; setStatus(s => s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s) }, [])
  useEffect(() => {
    const keydown = e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
      if (e.repeat) return
      if (e.code === 'KeyP' || e.code === 'Escape') pause()
      if (e.code === 'KeyR') reset()
    }
    const blur = () => { touch.current = {}; setStatus(s => s === 'playing' ? 'paused' : s) }
    window.addEventListener('keydown', keydown); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('blur', blur); clearTimeout(hitTimer.current) }
  }, [pause, reset])
  const onDeath = () => { setDeaths(n => n + 1); setProgress(0); setHit(true); clearTimeout(hitTimer.current); hitTimer.current = setTimeout(() => setHit(false), 1400) }
  const onWin = elapsed => { setStatus('won'); setTime(elapsed); setProgress(100); touch.current = {} }
  const onUpdate = (elapsed, distance) => { setTime(elapsed); setProgress(distance) }
  return <main className={`game ${hit ? 'is-hit' : ''}`}>
    <KeyboardControls map={controls}><div className="scene" aria-label="Pista 3D de Misión Cóndor"><SceneBoundary>
      <Canvas shadows orthographic camera={{ position: [14, 19, 25], zoom: 26, near: 0.1, far: 150 }} dpr={[1, 1.75]} onCreated={({ camera }) => camera.lookAt(0, 0, 0)} fallback={<div className="webgl-error">Tu navegador necesita soporte WebGL para mostrar el juego.</div>}>
        <Escenario simulation={simulation} status={status} onDeath={onDeath} onWin={onWin} onUpdate={onUpdate} touch={touch} />
      </Canvas>
    </SceneBoundary></div></KeyboardControls>
    <Marcador deaths={deaths} time={time} progress={progress} status={status} onPause={pause} onReset={reset} />
    <aside className="mission"><span className="eyebrow">01 / DESAFÍO DE ALTURA</span><h1>¡Rumbo<br />a la cima!</h1><p>Lleva a tu llama desde <em>A</em> hasta <em>B</em>.<br />Elige tu camino. Salta y supera cada desafío.</p><div className="legend"><span><i className="mint" /> Inicio</span><span><i className="gold" /> Meta</span><span><i className="coral" /> Peligro</span></div></aside>
    <div className="status-note" aria-live="polite">{hit ? '¡Choque! De vuelta al punto A. Inténtalo de nuevo.' : status === 'playing' ? 'Esquiva las rocas y las paredes emergentes. ¡Espacio para saltar!' : ''}</div>
    {status !== 'playing' && <div className={`overlay ${status === 'ready' ? 'intro-overlay' : ''}`}><section className="dialog" role="dialog" aria-labelledby="dialog-title">
      <span className="eyebrow">{status === 'won' ? 'EXPEDICIÓN COMPLETADA' : status === 'paused' ? 'TOMA UN RESPIRO' : '¿LISTA PARA LA AVENTURA?'}</span>
      <h2 id="dialog-title">{status === 'won' ? '¡Llegaste a la meta!' : status === 'paused' ? 'En pausa.' : '¡La cima te espera!'}</h2>
      <p>{status === 'won' ? `Conquistaste el paso en ${formatTime(time)} con ${deaths} ${deaths === 1 ? 'muerte' : 'muertes'}.` : status === 'paused' ? 'La montaña te espera. Continúa cuando estés listo.' : 'Rocas móviles y paredes que salen del suelo. Salta con espacio o busca el carril libre.'}</p>
      <button className="primary" onClick={() => { if (status === 'won') reset(); else setStatus('playing') }}>{status === 'won' ? 'Volver a intentar' : status === 'paused' ? 'Continuar expedición' : '¡Empezar aventura!'} <span>↗</span></button>
      {status === 'ready' && <small>WASD o flechas · Espacio para saltar · P para pausar</small>}
    </section></div>}
    <footer className="footer"><div className="keyboard"><kbd>W</kbd><span className="key-row"><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></div><p><strong>Muévete con WASD o las flechas</strong><span>Espacio · Saltar &nbsp; / &nbsp; P · Pausa &nbsp; / &nbsp; R · Reiniciar</span></p><span className="footer-right">CADA SALTO CUENTA <span>↗</span></span></footer>
    <nav className="touch-controls" aria-label="Controles táctiles">{[['left', '←', 'izquierda'], ['forward', '↑', 'adelante'], ['backward', '↓', 'atrás'], ['right', '→', 'derecha']].map(([key, label, name]) => <button key={key} aria-label={`Mover ${name}`} disabled={status !== 'playing'} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); touch.current[key] = true }} onPointerUp={() => { touch.current[key] = false }} onPointerCancel={() => { touch.current[key] = false }} onLostPointerCapture={() => { touch.current[key] = false }}>{label}</button>)}</nav>
  </main>
}
