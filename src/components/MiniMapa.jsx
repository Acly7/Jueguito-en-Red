import { KEY_COUNT } from '../labyrinth'
export default function MiniMapa({ room, view }) {
  return <div className="minimap"><span>MAPA · {room.short.toUpperCase()}</span><svg viewBox={`0 0 ${room.width} ${room.height}`} role="img" aria-label={`Minimapa de ${room.name}. Tu posición: ${view.cell.join(',')}`}>
    <rect width={room.width} height={room.height} fill="#151d2c" />
    {room.grid.flatMap((row, z) => row.map((v, x) => v ? <rect key={`${x},${z}`} x={x} y={z} width="1" height="1" fill={room.color} /> : null))}
    {room.portals.map((p, i) => <rect key={i} x={p.cell[0] + 0.15} y={p.cell[1] + 0.15} width="0.7" height="0.7" fill={p.requires && !view.keys.includes(p.requires) ? '#718096' : p.color}><title>{p.requires && !view.keys.includes(p.requires) ? 'Puerta cerrada' : 'Puerta abierta'}</title></rect>)}
    {room.puzzle?.cells.map((c, i) => <circle key={i} cx={c[0] + 0.5} cy={c[1] + 0.5} r="0.35" fill={view.puzzle.solved || room.puzzle.order.slice(0, view.puzzle.progress).includes(i) ? '#73ffd0' : '#ffdd8c'}><title>{view.puzzle.solved || room.puzzle.order.slice(0, view.puzzle.progress).includes(i) ? 'Runa activada' : 'Runa pendiente'}</title></circle>)}
    {room.keyCell && !view.keys.includes(room.id) && <rect x={room.keyCell[0] + 0.2} y={room.keyCell[1] + 0.2} width="0.6" height="0.6" fill={view.puzzle.solved ? '#fff' : '#718096'}><title>{view.puzzle.solved ? 'Llave liberada' : 'Llave encerrada'}</title></rect>}
    {room.id === 0 && <circle cx="9.5" cy="5.5" r="0.5" fill={view.keys.length === KEY_COUNT ? '#ffdf7d' : '#71634c'} />}
    <circle cx={view.cell[0] + 0.5} cy={view.cell[1] + 0.5} r="0.5" fill="#63ffe4" stroke="#ffffff" strokeWidth="0.12" />
  </svg><small>● Tú · Celeste: runa activa · Gris: cerrado</small></div>
}
