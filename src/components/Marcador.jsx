import { formatTime } from '../game'
export default function Marcador({ deaths, time, progress, status, onPause, onReset }) {
  return <header className="hud">
    <div className="brand"><span className="brand-symbol">△</span><div>MISIÓN CÓNDOR<small>EXPEDICIÓN / DE A A B</small></div></div>
    <div className="stats"><div><span>MUERTES</span><strong aria-live="polite" data-testid="deaths">{String(deaths).padStart(2, '0')}</strong></div><div><span>TIEMPO</span><strong data-testid="time">{formatTime(time)}</strong></div><div className="progress-stat"><span>RECORRIDO <b>{Math.round(progress)}%</b></span><progress value={progress} max="100" aria-label="Recorrido hacia la meta" /></div></div>
    <div className="actions"><button onClick={onPause} disabled={status === 'ready' || status === 'won'}>{status === 'paused' ? 'Continuar' : 'Pausa'} <kbd>P</kbd></button><button onClick={onReset} aria-label="Reiniciar partida" title="Reiniciar partida (R)">↻</button></div>
  </header>
}
