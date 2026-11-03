// Pasillos de 2.8 unidades: se puede esquivar al guardián pegándose a un lado.
export const TILE = 2.8
export const RADIUS = 0.38
export const SPEED = 6.2
const WIDTH = 19, HEIGHT = 15
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const id = ([x, z]) => `${x},${z}`
export const formatTime = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
export const world = ([x, z]) => ({ x: (x - (WIDTH - 1) / 2) * TILE, z: (z - (HEIGHT - 1) / 2) * TILE })
export const cellAt = p => [Math.round(p.x / TILE + (WIDTH - 1) / 2), Math.round(p.z / TILE + (HEIGHT - 1) / 2)]
export function pathBetween(grid, start, end) {
  const queue = [start], parents = new Map([[id(start), null]])
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]
    if (id(p) === id(end)) {
      const path = []
      for (let c = p; c; c = parents.get(id(c))) path.unshift(c)
      return path
    }
    for (const [dx, dz] of directions) {
      const n = [p[0] + dx, p[1] + dz]
      if (grid[n[1]]?.[n[0]] === 0 && !parents.has(id(n))) { parents.set(id(n), p); queue.push(n) }
    }
  }
  return []
}
function makeMaze(seed) {
  const grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(1))
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const stack = [[1, HEIGHT - 2]]
  grid[HEIGHT - 2][1] = 0
  while (stack.length) {
    const [x, z] = stack[stack.length - 1]
    const options = directions.filter(([dx, dz]) => x + dx * 2 > 0 && x + dx * 2 < WIDTH - 1 && z + dz * 2 > 0 && z + dz * 2 < HEIGHT - 1 && grid[z + dz * 2][x + dx * 2])
    if (!options.length) { stack.pop(); continue }
    const [dx, dz] = options[Math.floor(random() * options.length)]
    grid[z + dz][x + dx] = 0; grid[z + dz * 2][x + dx * 2] = 0
    stack.push([x + dx * 2, z + dz * 2])
  }
  // Pequeñas cámaras para esperar y esquivar; atajos que crean bucles.
  for (const [cx, cz] of [[2, 12], [8, 6], [16, 2]]) {
    for (let z = cz - 1; z <= cz + 1; z++) for (let x = cx - 1; x <= cx + 1; x++) grid[z][x] = 0
  }
  for (let n = 0; n < 10; n++) {
    const x = 2 + Math.floor(random() * 15), z = 2 + Math.floor(random() * 11)
    if ((grid[z][x - 1] === 0 && grid[z][x + 1] === 0) || (grid[z - 1][x] === 0 && grid[z + 1][x] === 0)) grid[z][x] = 0
  }
  return grid
}
function makeHub() {
  const grid = Array.from({ length: HEIGHT }, (_, z) => Array.from({ length: WIDTH }, (_, x) => Number(x === 0 || z === 0 || x === WIDTH - 1 || z === HEIGHT - 1)))
  for (let z = 3; z <= 9; z++) for (const x of [5, 13]) if (z !== 7) grid[z][x] = 1
  for (let x = 6; x <= 12; x++) if (x !== 9) grid[3][x] = 1
  for (const [x, z] of [[3, 4], [15, 4], [3, 10], [15, 10]]) grid[z][x] = 1
  return grid
}
const definitions = [
  { name: 'Santuario de la Llamita', short: 'Santuario', color: '#80c878', accent: '#bceba5', description: 'El refugio. Reúne las seis llaves y vuelve al altar.', grid: makeHub() },
  { name: 'Laberinto de Zafiro', short: 'Zafiro', color: '#5554cf', accent: '#aaa8ff', description: 'Pasillos azules, desvíos y guardianes. Busca la llave azul.', grid: makeMaze(2600) },
  { name: 'Fortaleza de Ámbar', short: 'Ámbar', color: '#c18e31', accent: '#ffda80', description: 'Las trampas despiertan. Observa el suelo antes de avanzar.', grid: makeMaze(1980) },
  { name: 'Cripta Violeta', short: 'Violeta', color: '#9749bb', accent: '#e8a5ff', description: 'Guardianes más rápidos. Resuelve las runas para liberar su llave.', grid: makeMaze(1979) },
  { name: 'Catacumbas de Jade', short: 'Jade', color: '#287969', accent: '#80ebcb', description: 'El reloj de las runas no espera. Encuentra el orden y corre.', grid: makeMaze(6401) },
  { name: 'Bastión Carmesí', short: 'Carmesí', color: '#9d334b', accent: '#ff8eaa', description: 'Guardianes veloces y runas contrarreloj. Planea tu ruta.', grid: makeMaze(9307) },
  { name: 'Ciudadela de Hielo', short: 'Hielo', color: '#377aa3', accent: '#9ce4ff', description: 'El último desafío: seis llaves para volver a casa.', grid: makeMaze(12011) },
]
export const KEY_COUNT = definitions.length - 1
export const RUNES = ['SOL', 'LUNA', 'ESTRELLA']
export const ROOMS = definitions.map((room, index) => {
  const start = index === 0 ? [9, 12] : [1, 13]
  const portals = index === 0
    ? [{ cell: [17, 7], to: 1, arrival: [2, 12], label: 'ZAFIRO', color: '#aaa8ff' }]
    : [{ cell: [1, 13], to: index - 1, arrival: index === 1 ? [16, 7] : [16, 2], label: 'VOLVER', color: '#a0c7bd' },
      { cell: [17, 1], to: index === KEY_COUNT ? 0 : index + 1, arrival: index === KEY_COUNT ? [2, 7] : [2, 12], requires: index, label: index === KEY_COUNT ? 'SANTUARIO' : definitions[index + 1].short.toUpperCase(), color: index === KEY_COUNT ? '#bceba5' : definitions[index + 1].accent }]
  const floors = room.grid.flatMap((row, z) => row.flatMap((v, x) => v === 0 ? [[x, z]] : []))
  const candidates = floors.filter(c => portals.every(p => Math.hypot(c[0] - p.cell[0], c[1] - p.cell[1]) > 3))
  const keyCell = index === 0 ? null : candidates.reduce((best, c) => pathBetween(room.grid, start, c).length > pathBetween(room.grid, start, best).length ? c : best, candidates[0])
  const safe = cell => portals.every(p => Math.hypot(cell[0] - p.cell[0], cell[1] - p.cell[1]) > 2.5) && Math.hypot(cell[0] - start[0], cell[1] - start[1]) > 3 && (!keyCell || id(cell) !== id(keyCell))
  const patrolCells = floors.filter(safe)
  const enemyCount = index + 3
  const enemies = index === 0 ? [] : Array.from({ length: enemyCount }, (_, n) => {
    const a = patrolCells[Math.floor(patrolCells.length * (n + 0.4) / (enemyCount + 0.5))]
    const b = patrolCells[Math.floor(patrolCells.length * (n + 1.1) / (enemyCount + 0.5)) % patrolCells.length]
    const full = pathBetween(room.grid, a, b)
    // Each patrol stays on a contiguous section of floor, away from door landings.
    const segment = []
    for (const c of full) { if (!safe(c)) break; segment.push(c); if (segment.length >= 13) break }
    if (segment.length < 2) {
      const neighbor = directions.map(([dx, dz]) => [a[0] + dx, a[1] + dz]).find(c => room.grid[c[1]]?.[c[0]] === 0 && safe(c))
      if (neighbor) segment.push(...(segment.length ? [] : [a]), neighbor)
    }
    return { id: n, route: segment.length >= 2 ? segment : full.slice(0, 2), speed: 3 + index * 0.4 + n * 0.12, phase: n * 3.7, radius: 0.52 }
  })
  const traps = index < 2 ? [] : patrolCells.filter(c => safe(c)).filter((_, i) => i % Math.max(10, 29 - index * 3) === 8).map((cell, i) => ({ cell, phase: i * 0.83 }))
  const switchCells = index === 0 ? [] : [0.18, 0.48, 0.78].map(f => candidates.filter(c => id(c) !== id(keyCell))[Math.floor((candidates.length - 1) * f)])
  const order = index % 2 ? [2, 0, 1] : [1, 2, 0]
  const routeLength = switchCells.length ? order.slice(1).reduce((sum, n, i) => sum + pathBetween(room.grid, switchCells[order[i]], switchCells[n]).length * TILE, 0) : 0
  const puzzle = index === 0 ? null : { cells: switchCells, order, timed: index >= 4, limit: Math.ceil(routeLength / SPEED * 1.8 + 15) }
  return { ...room, puzzle, id: index, width: WIDTH, height: HEIGHT, start, portals, keyCell, enemies, traps }
})

export function isWalkable(room, p) {
  const [cx, cz] = cellAt(p)
  for (let z = cz - 1; z <= cz + 1; z++) for (let x = cx - 1; x <= cx + 1; x++) {
    if (room.grid[z]?.[x] === 0) continue
    const center = world([x, z])
    const dx = Math.max(Math.abs(p.x - center.x) - TILE / 2, 0)
    const dz = Math.max(Math.abs(p.z - center.z) - TILE / 2, 0)
    if (dx * dx + dz * dz < RADIUS * RADIUS) return false
  }
  return true
}
export function movePlayer(room, position, input, delta) {
  let x = Number(Boolean(input.right)) - Number(Boolean(input.left)), z = Number(Boolean(input.backward)) - Number(Boolean(input.forward))
  const length = Math.hypot(x, z)
  if (!length) return { ...position }
  x = x / length * SPEED * delta; z = z / length * SPEED * delta
  const next = { ...position }
  // Substeps also protect against callers passing a long frame.
  const steps = Math.max(1, Math.ceil(Math.hypot(x, z) / (RADIUS / 2)))
  for (let i = 0; i < steps; i++) {
    if (isWalkable(room, { x: next.x + x / steps, z: next.z })) next.x += x / steps
    if (isWalkable(room, { x: next.x, z: next.z + z / steps })) next.z += z / steps
  }
  return next
}
export function enemyPosition(enemy, time) {
  const total = (enemy.route.length - 1) * TILE
  const cycle = (time * enemy.speed + enemy.phase) % (total * 2)
  const distance = cycle <= total ? cycle : 2 * total - cycle
  const i = Math.min(enemy.route.length - 2, Math.floor(distance / TILE)), t = (distance - i * TILE) / TILE
  const a = world(enemy.route[i]), b = world(enemy.route[i + 1])
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }
}
export function trapState(trap, time) { const phase = (time + trap.phase) % 4.8; return phase < 2.8 ? 'safe' : phase < 3.6 ? 'warning' : 'active' }
const near = (a, b, radius) => Math.hypot(a.x - b.x, a.z - b.z) < radius
export function dangerAt(room, p, time) {
  return room.enemies.some(e => near(p, enemyPosition(e, time), RADIUS + e.radius)) || room.traps.some(t => trapState(t, time) === 'active' && near(p, world(t.cell), 0.9))
}
export function createSimulation() {
  return { room: 0, position: world(ROOMS[0].start), time: 0, deaths: 0, keys: [], visited: [0], immunity: 0, portalCooldown: 0, messageUntil: 0, puzzles: {}, interactHeld: false, message: 'Encuentra el portal azul para entrar al laberinto.', won: false }
}
export function snapshot(sim) {
  return { puzzle: { ...(sim.puzzles[sim.room] || { progress: 0, solved: false, deadline: 0 }) }, room: sim.room, time: sim.time, deaths: sim.deaths, keys: [...sim.keys], visited: [...sim.visited], won: sim.won, message: sim.message, cell: cellAt(sim.position) }
}
export function stepSimulation(sim, input, delta) {
  if (sim.won) return
  const pressed = Boolean(input.interact) && !sim.interactHeld
  sim.interactHeld = Boolean(input.interact)
  updatePuzzle(sim, pressed)
  let remaining = Math.min(delta, 0.1)
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120); remaining -= dt; sim.time += dt
    const room = ROOMS[sim.room]
    sim.position = movePlayer(room, sim.position, input, dt)
    if (sim.time >= sim.immunity && dangerAt(room, sim.position, sim.time)) {
      for (const [key, puzzle] of Object.entries(sim.puzzles)) if (!puzzle.solved) delete sim.puzzles[key]
      sim.deaths++; sim.room = 0; sim.position = world(ROOMS[0].start); sim.immunity = sim.time + 1.5; sim.portalCooldown = sim.time + 0.8
      sim.message = '¡Te alcanzaron! Vuelves al santuario. Conservas tus llaves.'; sim.messageUntil = sim.time + 5
      return
    }
    if (room.keyCell && sim.puzzles[room.id]?.solved && !sim.keys.includes(room.id) && near(sim.position, world(room.keyCell), 0.9)) {
      sim.keys.push(room.id); sim.message = `Llave de ${room.short} recuperada. La siguiente puerta está abierta.`; sim.messageUntil = sim.time + 5
    }
    if (sim.room === 0 && sim.keys.length === KEY_COUNT && near(sim.position, world([9, 5]), 1.1)) {
      sim.won = true; sim.message = '¡El santuario vuelve a brillar!'; return
    }
    if (sim.time >= sim.portalCooldown) for (const portal of room.portals) {
      if (!near(sim.position, world(portal.cell), 0.75)) continue
      if (portal.requires && !sim.keys.includes(portal.requires)) {
        sim.message = `Puerta cerrada: necesitas la llave de ${room.short}.`; sim.messageUntil = sim.time + 3; continue
      }
      sim.room = portal.to; sim.position = world(portal.arrival); sim.portalCooldown = sim.time + 1; sim.immunity = sim.time + 1.2
      if (!sim.visited.includes(portal.to)) sim.visited.push(portal.to)
      sim.message = ROOMS[portal.to].description; sim.messageUntil = sim.time + 4
      return
    }
    if (sim.time > sim.messageUntil) sim.message = sim.keys.length === KEY_COUNT ? 'Regresa al altar dorado del santuario para ganar.' : room.description
  }
}

// Interacción por pulsación: mantener E no activa varias runas ni repite errores.
export function updatePuzzle(sim, pressed) {
  const room = ROOMS[sim.room]
  if (!room.puzzle) return
  const state = sim.puzzles[sim.room] ||= { progress: 0, solved: false, deadline: 0 }
  if (state.solved) return
  if (state.deadline && sim.time >= state.deadline) {
    state.progress = 0; state.deadline = 0
    sim.message = 'Se agotó el tiempo. Vuelve a empezar la secuencia.'; sim.messageUntil = sim.time + 4
  }
  if (!pressed) return
  const index = room.puzzle.cells.findIndex(c => near(sim.position, world(c), 1.25))
  if (index < 0) { sim.message = 'Acércate a un pedestal de runas y pulsa E.'; sim.messageUntil = sim.time + 2; return }
  if (index !== room.puzzle.order[state.progress]) {
    state.progress = 0; state.deadline = 0
    sim.message = 'Orden incorrecto. Las runas se apagan; revisa la pista.'; sim.messageUntil = sim.time + 4
    return
  }
  if (state.progress === 0 && room.puzzle.timed) state.deadline = sim.time + room.puzzle.limit
  state.progress++
  state.solved = state.progress === room.puzzle.order.length
  if (state.solved) state.deadline = 0
  sim.message = state.solved ? '¡Puzle resuelto! La jaula de la llave se ha abierto.' : `Runa correcta (${state.progress}/3). Busca la siguiente.`
  sim.messageUntil = sim.time + 4
}
