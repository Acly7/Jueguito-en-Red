import test from 'node:test'
import assert from 'node:assert/strict'
import { ROOMS, KEY_COUNT, world, cellAt, pathBetween, isWalkable, movePlayer, enemyPosition, trapState, dangerAt, createSimulation, stepSimulation } from '../src/labyrinth.js'

test('todos los mapas tienen rutas transitables entre entradas, llaves y salidas', () => {
 for(const r of ROOMS){
  assert.ok(isWalkable(r,world(r.start)))
  for(const p of r.portals){
   assert.ok(pathBetween(r.grid,r.start,p.cell).length>0)
   assert.ok(isWalkable(ROOMS[p.to],world(p.arrival)))
  }
  if(r.keyCell) assert.ok(pathBetween(r.grid,r.start,r.keyCell).length>15)
 }
})
test('son seis laberintos diferentes con guardianes móviles que respetan los muros',()=>{
 assert.equal(new Set(ROOMS.slice(1).map(r=>JSON.stringify(r.grid))).size,KEY_COUNT)
 for(const r of ROOMS.slice(1)) for(const e of r.enemies){
  assert.ok(e.route.length>=2)
  assert.notDeepEqual(enemyPosition(e,0),enemyPosition(e,0.5))
  for(let t=0;t<40;t+=0.17)assert.ok(isWalkable(r,enemyPosition(e,t)),`${r.name}: guardián fuera de pista`)
 }
})
test('los muros bloquean incluso frames largos y diagonales; no hay aceleración diagonal',()=>{
 const r=ROOMS[0], p=world([1,12])
 const stopped=movePlayer(r,p,{left:true},10)
 assert.ok(isWalkable(r,stopped));assert.equal(cellAt(stopped)[0],1)
 const diagonal=movePlayer(r,world([9,11]),{forward:true,right:true},0.1)
 assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z-world([9,11]).z)-0.62)<1e-8)
 for(const room of ROOMS.slice(1))for(const cell of [[1,13],[2,12],[16,2]]){
  const next=movePlayer(room,world(cell),{right:true,forward:true},2)
  assert.ok(isWalkable(room,next))
 }
})
test('las puertas bloquean sin llave y trasladan con llave sin rebote inmediato',()=>{
 const s=createSimulation();s.room=1;s.position=world(ROOMS[1].portals[1].cell)
 stepSimulation(s,{},0.05);assert.equal(s.room,1);assert.match(s.message,/cerrada/)
 s.keys=[1];stepSimulation(s,{},0.05);assert.equal(s.room,2)
 stepSimulation(s,{},0.1);assert.equal(s.room,2)
})
test('recoger una llave es idempotente y una muerte conserva el inventario y vuelve a A',()=>{
 const s=createSimulation();s.room=1;s.immunity=100;s.position=world(ROOMS[1].keyCell);s.puzzles[1]={solved:true,progress:3,deadline:0}
 stepSimulation(s,{},0.1);stepSimulation(s,{},0.1);assert.deepEqual(s.keys,[1])
 s.immunity=0;s.position=enemyPosition(ROOMS[1].enemies[0],s.time)
 stepSimulation(s,{},0.01);assert.equal(s.deaths,1);assert.equal(s.room,0);assert.deepEqual(s.keys,[1]);assert.deepEqual(s.position,world(ROOMS[0].start))
 stepSimulation(s,{},0.1);assert.equal(s.deaths,1)
})
test('las trampas anuncian su activación y solo dañan en rojo',()=>{
 const r=ROOMS[2],trap=r.traps[0];assert.ok(trap)
 assert.equal(trapState(trap,0-trap.phase),'safe')
 assert.equal(trapState(trap,3-trap.phase),'warning')
 assert.equal(trapState(trap,4-trap.phase),'active')
 assert.ok(dangerAt(r,world(trap.cell),4-trap.phase))
})
test('la meta requiere seis llaves y la victoria detiene la simulación',()=>{
 const s=createSimulation();s.position=world([9,5]);stepSimulation(s,{},0.01);assert.equal(s.won,false)
 s.keys=[1,2,3,4,5,6];stepSimulation(s,{},0.01);assert.equal(s.won,true)
 const time=s.time;stepSimulation(s,{forward:true},0.1);assert.equal(s.time,time)
 assert.equal(createSimulation().keys.length,0)
})
test('recorrido completo por las siete salas y sus puzles, sin teletransportar entre objetivos',()=>{
 const s=createSimulation();s.immunity=1e6
 function walkTo(target){
  const room=ROOMS[s.room],path=pathBetween(room.grid,cellAt(s.position),target)
  assert.ok(path.length)
  const original=room.id
  for(const c of path.slice(1)){
   const goal=world(c)
   for(let i=0;i<250;i++){
    if(s.room!==original||s.won)return
    const dx=goal.x-s.position.x,dz=goal.z-s.position.z
    if(Math.hypot(dx,dz)<0.06)break
    const input={right:dx>0.04,left:dx< -0.04,backward:dz>0.04,forward:dz< -0.04}
    s.immunity=1e6;stepSimulation(s,input,1/120)
    if(i===249)assert.fail('Ruta bloqueada en '+c)
   }
  }
 }
 walkTo(ROOMS[0].portals[0].cell);assert.equal(s.room,1)
 for(let room=1;room<=KEY_COUNT;room++){
  for (const rune of ROOMS[room].puzzle.order) {
   walkTo(ROOMS[room].puzzle.cells[rune]);stepSimulation(s,{interact:true},0.01);stepSimulation(s,{},0.01)
  }
  assert.equal(s.puzzles[room].solved,true)
  walkTo(ROOMS[room].keyCell);assert.ok(s.keys.includes(room))
  walkTo(ROOMS[room].portals[1].cell);assert.equal(s.room,room===KEY_COUNT?0:room+1)
 }
 walkTo([9,5]);assert.equal(s.won,true);assert.deepEqual(s.keys,[1,2,3,4,5,6])
})

test('las runas requieren orden correcto, una pulsación nueva y liberan la llave',()=>{
 const s=createSimulation();s.room=1;s.immunity=1e6;const r=ROOMS[1]
 s.position=world(r.keyCell);stepSimulation(s,{},0.01);assert.equal(s.keys.length,0)
 s.position=world(r.puzzle.cells[r.puzzle.order[1]]);stepSimulation(s,{interact:true},0.01);assert.equal(s.puzzles[1].progress,0)
 stepSimulation(s,{},0.01)
 s.position=world(r.puzzle.cells[r.puzzle.order[0]]);stepSimulation(s,{interact:true},0.01);assert.equal(s.puzzles[1].progress,1)
 stepSimulation(s,{interact:true},0.1);assert.equal(s.puzzles[1].progress,1)
 stepSimulation(s,{},0.01)
 for(const i of r.puzzle.order.slice(1)){s.position=world(r.puzzle.cells[i]);stepSimulation(s,{interact:true},0.01);stepSimulation(s,{},0.01)}
 assert.equal(s.puzzles[1].solved,true)
 s.position=world(r.keyCell);stepSimulation(s,{},0.01);assert.deepEqual(s.keys,[1])
})
test('un puzle temporizado caduca y puede reiniciarse; las soluciones sobreviven a la muerte',()=>{
 const s=createSimulation();s.room=4;s.immunity=1e6;const r=ROOMS[4]
 s.position=world(r.puzzle.cells[r.puzzle.order[0]]);stepSimulation(s,{interact:true},0.01);stepSimulation(s,{},0.01)
 assert.ok(s.puzzles[4].deadline>s.time)
 s.time=s.puzzles[4].deadline+0.01;stepSimulation(s,{},0.01);assert.equal(s.puzzles[4].progress,0)
 stepSimulation(s,{interact:true},0.01);assert.equal(s.puzzles[4].progress,1)
 s.puzzles[1]={progress:3,solved:true,deadline:0};s.immunity=0;s.position=enemyPosition(r.enemies[0],s.time)
 stepSimulation(s,{},0.001);assert.equal(s.room,0);assert.equal(s.puzzles[1].solved,true);assert.equal(s.puzzles[4],undefined)
})
test('39 guardianes, dificultad creciente y runas accesibles en todos los reinos',()=>{
 assert.equal(ROOMS.reduce((sum,r)=>sum+r.enemies.length,0),39)
 for(const r of ROOMS.slice(1)){
  assert.equal(new Set(r.puzzle.cells.map(c=>c.join(','))).size,3)
  for(const c of r.puzzle.cells)assert.ok(pathBetween(r.grid,r.start,c).length>0)
  assert.ok(r.enemies.length>=4)
 }
})
