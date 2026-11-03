import test from 'node:test'
import assert from 'node:assert/strict'
import { START, GOAL, OBSTACLES, movePlayer, hasCollision, reachedGoal, obstacleX, progressAt } from '../src/game.js'
const keys = (overrides = {}) => ({ forward: false, backward: false, left: false, right: false, ...overrides })
test('W avanza hacia B y las diagonales no aumentan la velocidad', () => {
  assert.equal(movePlayer(START, keys({ forward: true }), 1).z, 5)
  const p = movePlayer(START, keys({ forward: true, right: true }), 1)
  assert.ok(Math.abs(Math.hypot(p.x, p.z - START.z) - 5) < 1e-10)
})
test('el jugador permanece dentro de la pista', () => {
  assert.equal(movePlayer(START, keys({ right: true }), 100).x, 5.25)
  assert.equal(movePlayer(START, keys({ backward: true }), 100).z, 11)
})
test('cada obstáculo se mueve y permite detectar su colisión', () => {
  for (const o of OBSTACLES) {
    assert.notEqual(obstacleX(o, 0), obstacleX(o, 1))
    assert.equal(hasCollision({ x: obstacleX(o, 2), z: o.z }, 2), true)
  }
  for (let t = 0; t < 20; t += 0.1) assert.equal(hasCollision(START, t), false)
})
test('la victoria exige llegar a la zona B, no basta con avanzar por el borde', () => {
  assert.equal(reachedGoal(GOAL), true)
  assert.equal(reachedGoal(START), false)
  assert.equal(reachedGoal({ x: 5, z: -10 }), false)
  assert.equal(progressAt(START), 0)
  assert.equal(progressAt(GOAL), 100)
})

import { WALLS, wallHeight, wallWarning } from '../src/game.js'
test('las paredes aparecen y desaparecen, y siempre queda un paso lateral', () => {
  for (const w of WALLS) {
    assert.equal(wallHeight(w, 0 - w.phase), 0)
    assert.ok(wallHeight(w, 2 - w.phase) > 1)
    assert.equal(wallWarning(w, 1 - w.phase), true)
    assert.equal(hasCollision({ x: w.x, z: w.z }, 2 - w.phase), true)
    assert.equal(hasCollision({ x: w.x, z: w.z }, 2 - w.phase, 2), false)
    assert.equal(hasCollision({ x: w.x > 0 ? -5.1 : 5.1, z: w.z }, 2 - w.phase), false)
  }
})
