export const START = { x: 0, z: 10 }
export function formatTime(seconds) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` }
export const GOAL = { x: 0, z: -10 }
export const OBSTACLES = [
  { id: 1, z: 5.8, speed: 1.1, phase: 0, radius: 0.85 },
  { id: 2, z: 1.8, speed: 1.4, phase: 1.8, radius: 0.9 },
  { id: 3, z: -2.2, speed: 0.95, phase: 3.3, radius: 1 },
  { id: 4, z: -6.2, speed: 1.6, phase: 0.7, radius: 0.8 },
]
// Barreras emergentes: dejan un carril lateral libre para que siempre se pueda pasar.
export const WALLS = [
  { id: 'a', z: 3.8, x: -1.25, width: 7.5, phase: 0 },
  { id: 'b', z: -0.2, x: 1.25, width: 7.5, phase: 2.2 },
  { id: 'c', z: -4.6, x: -1.25, width: 7.5, phase: 4.1 },
]
export function wallHeight(wall, time) {
  const cycle = (time + wall.phase) % 6
  if (cycle < 1.3) return 0
  if (cycle < 1.8) return (cycle - 1.3) * 2.4
  if (cycle < 3.8) return 1.2
  if (cycle < 4.3) return (4.3 - cycle) * 2.4
  return 0
}
export function wallWarning(wall, time) {
  const cycle = (time + wall.phase) % 6
  return cycle >= 0.65 && cycle < 1.3
}
export function obstacleX(o, time) { return Math.sin(time * o.speed + o.phase) * 4.5 }
export function movePlayer(position, input, delta) {
  let x = Number(input.right) - Number(input.left)
  let z = Number(input.backward) - Number(input.forward)
  const length = Math.hypot(x, z)
  if (length) { x /= length; z /= length }
  return { x: Math.max(-5.25, Math.min(5.25, position.x + x * 5 * delta)), z: Math.max(-11, Math.min(11, position.z + z * 5 * delta)) }
}
export function hasCollision(p, time, jumpHeight = 0) {
  const rocks = OBSTACLES.some(o => Math.hypot(p.x - obstacleX(o, time), p.z - o.z) < 0.48 + o.radius && jumpHeight < o.radius * 1.7)
  const walls = WALLS.some(w => wallHeight(w, time) > 0.35 && Math.abs(p.x - w.x) < w.width / 2 + 0.3 && Math.abs(p.z - w.z) < 0.38 && jumpHeight < wallHeight(w, time) + 0.15)
  return rocks || walls
}
export function reachedGoal(p) { return Math.hypot(p.x - GOAL.x, p.z - GOAL.z) < 1.5 }
export function progressAt(p) { return Math.max(0, Math.min(100, (START.z - p.z) / 20 * 100)) }
