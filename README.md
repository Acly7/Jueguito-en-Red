# Misión Cóndor: de A a B

Juego 3D con React, Vite, @react-three/fiber, @react-three/drei y three. Una llama debe cruzar el paso andino esquivando cuatro rocas móviles.

## Ejecutar

Requiere una versión de Node compatible con Vite 8 (se verificó con Node 24).

```sh
npm install
npm run dev
```

Abre la dirección que indique Vite (normalmente http://localhost:5173).

```sh
npm run build
npm run lint
npm test
```

## Cómo jugar

- Pulsa **Comenzar expedición**.
- WASD o flechas: mover la llama sobre la pista. En pantallas pequeñas también hay botones táctiles.
- El círculo verde A es el inicio; el arco amarillo B es la meta.
- Las cuatro rocas se desplazan de lado a lado con diferentes velocidades.
- Un choque suma una muerte y devuelve al punto A. El cronómetro continúa.
- Entra en la zona B para ganar. Llegar al fondo por un borde no basta.
- P o Escape: pausar/continuar. Al salir de la ventana también se pausa.
- R o el botón circular: reinicia muertes, tiempo, posición y obstáculos.

## Organización del código

| Archivo | Responsabilidad |
| --- | --- |
| src/App.jsx | Canvas de Fiber, KeyboardControls de Drei, estado general, pausa, victoria y reinicio |
| src/components/Jugador.jsx | Llama geométrica, lectura de teclado con useKeyboardControls y simulación con useFrame |
| src/components/Obstaculo.jsx | Roca reutilizable, movimiento sinusoidal y rotación |
| src/components/Marcador.jsx | Contador de muertes, tiempo, progreso y acciones |
| src/components/Escenario.jsx | Pista, luces, cámara adaptable, montañas y zonas A/B |
| src/game.js | Reglas puras: movimiento, límites, distancias, obstáculos y meta |
| tests/game.test.js | Pruebas de movimiento diagonal, límites, colisiones y meta |

### Explicación para la defensa

Fiber crea la escena mediante `Canvas`; `useFrame` ejecuta la simulación y mueve los objetos en cada cuadro. Drei proporciona `KeyboardControls` y `useKeyboardControls`, que convierten WASD/flechas en acciones con nombres. Three aporta el motor gráfico y una textura de texto local para marcar A/B. No se descargan modelos, tipografías ni texturas externas.

El movimiento multiplica la velocidad por el tiempo transcurrido. Se normalizan las diagonales para que no sean más rápidas. Cada cuadro se divide en pasos de hasta 1/120 de segundo: se avanza el reloj, se mueve al jugador y se comprueba la distancia a cada roca en el plano XZ. Si la distancia es menor que la suma de los radios, ocurre un choque. El inicio está separado de las rocas para evitar muertes repetidas al reaparecer.

React guarda los datos visibles con useState. Las posiciones y el reloj de simulación se conservan en useRef para no reconstruir toda la interfaz en cada cuadro. La interfaz se actualiza aproximadamente cada 80 ms; los eventos de choque y victoria se muestran inmediatamente.

## Trabajo de equipo y Git

El repositorio tiene una rama `main` y los avances de esta implementación se publican en `boris-avances`. Esto no representa el historial ni las contribuciones de varios integrantes. No se crean PR automáticamente.

La guía pide ramas `feature/jugador`, `feature/obstaculos` y `feature/marcador`, varios commits reales por integrante y al menos un Pull Request revisado por otra persona. Cada integrante debe implementar o mejorar su parte, probarla, guardar commits claros y abrir su PR. Reparto sugerido:

- Jugador: controles, cámara, apariencia y pruebas de movimiento.
- Obstáculos: velocidades, dificultad y pruebas de choques.
- Marcador: interfaz, zonas A/B, victoria y pruebas de reinicio.

Con dos integrantes, una persona puede asumir dos ramas. No inventen autores, commits ni revisiones para simular participación.

Ejemplo, después de integrar la base y actualizar main:

```sh
git switch main
git pull
git switch -c feature/jugador
# Realizar y probar una mejora real.
git add src/components/Jugador.jsx
git commit -m "Mejora el movimiento del jugador"
git push -u origin feature/jugador
# Abrir un Pull Request hacia main y pedir revisión al compañero.
```

## Guion de defensa (2 a 3 minutos)

1. 0:00-0:25: presentar integrantes, objetivo y controles.
2. 0:25-1:05: mostrar movimiento, un choque, incremento de muertes, regreso a A y victoria.
3. 1:05-1:45: explicar Canvas/useFrame (Fiber), KeyboardControls/useKeyboardControls (Drei), distancia de colisión y contador.
4. 1:45-2:20: mostrar ramas, commits reales de cada integrante y al menos un Pull Request.
5. 2:20-2:45: cada integrante explica su contribución y una dificultad resuelta.

Todos deben aparecer o hablar. La entrega académica requiere el enlace al repositorio y el enlace al video en la plataforma indicada por el docente. La grabación, la revisión entre compañeros y la entrega quedan a cargo del equipo.
