# Misión Cóndor — Los reinos del laberinto

Aventura 3D con React, Vite, @react-three/fiber, @react-three/drei y Three. Conserva la llama de figuras geométricas y añade cuatro salas conectadas, inspiradas en los muros de colores y los laberintos de Adventure. Los mapas, modelos y gráficos son propios y se generan localmente.

## Ejecutar y verificar

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
```

Abre la URL indicada por Vite. Se verificó con Node 24. No hay modelos, fuentes ni texturas remotas que descargar al jugar.

## Objetivo y dificultad

1. Empiezas en A, dentro del **Santuario del Cóndor**, la zona verde segura. Busca el portal de Zafiro a la derecha.
2. Explora el **Laberinto de Zafiro** (azul), consigue su llave y abre la puerta a Ámbar.
3. Cruza la **Fortaleza de Ámbar** (dorada), recupera su llave y pasa a Violeta.
4. Encuentra la tercera llave en la **Cripta Violeta** y usa su portal de regreso al santuario.
5. Con las tres llaves, entra en el altar B del santuario para ganar.

Cada laberinto tiene un trazado diferente, bifurcaciones, callejones, pequeños refugios y tres guardianes móviles. Los guardianes de los últimos reinos son más rápidos. En Ámbar y Violeta también hay pinchos temporizados: gris significa seguro, ámbar avisa y rojo hace daño. Espera a que bajen antes de cruzar. Los pasillos permiten esquivar a los guardianes pegándote a un lado.

Un choque suma una muerte y devuelve a A en el santuario. **Conservas las llaves**, pero debes volver a recorrer los pasillos. Las puertas anteriores permiten regresar. El cronómetro mide tiempo de simulación activa; se detiene durante la pausa o al ganar. Reiniciar elimina todo el progreso.

## Controles

- WASD o flechas: moverse. Las diagonales no aumentan la velocidad.
- P o Escape: pausar/continuar; salir de la ventana también pausa.
- R o botón circular: nueva partida, borra llaves, tiempo y muertes.
- En pantallas pequeñas hay botones táctiles.
- Las llaves se recogen al acercarse y los portales se usan al entrar en su círculo.
- El aro turquesa identifica a la llama; una pulsación suave indica protección al reaparecer o cambiar de sala.

## Código y defensa

| Archivo | Responsabilidad |
| --- | --- |
| src/App.jsx | Canvas, controles Drei, estado de interfaz, inventario, salas visitadas, pausa y victoria |
| src/labyrinth.js | Cuatro mapas deterministas, búsqueda de rutas, movimiento, colisiones, llaves, puertas y reglas de simulación |
| src/components/Jugador.jsx | Llama original, useKeyboardControls y actualización por cuadro con useFrame |
| src/components/Obstaculo.jsx | Guardianes reutilizables que patrullan rutas de suelo sin atravesar paredes |
| src/components/Laberinto.jsx | Suelo, muros, cámara 3D adaptable, puertas, llaves, altar y trampas animadas |
| src/components/Marcador.jsx | Contador de muertes, tiempo, progreso de llaves y acciones |
| tests/game.test.js | Conectividad, movimiento, guardianes, puertas, inventario, trampas, victoria y recorrido integral |

Fiber dibuja la escena con Canvas y permite actualizarla con useFrame. Drei interpreta el teclado con KeyboardControls y useKeyboardControls. Three proporciona las geometrías, luces, materiales y texturas locales de los letreros.

La simulación usa subpasos de hasta 1/120 s y limita el tiempo acumulado en un cuadro largo. La posición se comprueba contra los muros en ambos ejes, permitiendo deslizarse por ellos sin atravesarlos. Las colisiones con guardianes usan distancia entre radios; las trampas solo dañan durante la fase activa. La misma función stepSimulation se usa en el juego y en las pruebas.

Los laberintos usan semillas fijas para reproducir los trazados. Se generan caminos conectados y después se añaden pequeñas cámaras y algunos bucles. La búsqueda BFS comprueba rutas y define patrullas. Las llaves se ubican lejos de la entrada por distancia de recorrido, no solo por distancia en línea recta.

La prueba integral recorre entradas, llaves, puertas y altar usando movimiento real de la simulación; desactiva el daño para verificar únicamente que la geometría y la progresión no bloquean la partida. Las muertes y trampas se verifican por separado. La prueba en navegador verifica además renderizado 3D, teclado, transición de sala, pausa y presentación móvil.

## Trabajo de equipo y entrega

La guía original exige ramas feature/jugador, feature/obstaculos y feature/marcador, commits reales por integrante y un Pull Request revisado por otra persona. Cada integrante debe trabajar y explicar su contribución; no se deben simular autores ni revisiones. Esta actualización local no crea una entrega ni publica cambios en GitHub.

Guion sugerido para el video de 2–3 minutos:

1. Presentar integrantes, objetivo y controles.
2. Mostrar a la llama, un laberinto, un choque y el aumento del contador, una llave y una puerta. Mostrar también la victoria tras regresar con las tres llaves.
3. Enseñar Canvas/useFrame de Fiber y KeyboardControls/useKeyboardControls de Drei.
4. Explicar brevemente muros, patrullas y trampas temporizadas.
5. Mostrar ramas, commits y PR reales. Cada integrante explica su parte.

La entrega académica sigue requiriendo el enlace del repositorio y el del video.
