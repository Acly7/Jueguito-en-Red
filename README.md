# Misión Llamita — Los reinos del laberinto

Aventura con React, Three, React Three Fiber y Drei. La llamita original recorre **siete zonas**, resuelve **seis puzles** y esquiva **39 guardianes**. La cámara usa proyección perspectiva, seguimiento cercano y vista general opcional. La carpeta existente y el remoto de Git se mantienen para conservar las rutas del proyecto.

## Ejecutar

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
```

Se comprobó con Node 24. Los modelos y gráficos son locales.

## Recorrido

| Zona | Guardianes | Puzle |
| --- | ---: | --- |
| Santuario de la Llamita | 0 | Inicio A y altar final B |
| Laberinto de Zafiro | 4 | Secuencia de runas |
| Fortaleza de Ámbar | 5 | Secuencia y pinchos temporizados |
| Cripta Violeta | 6 | Secuencia y pinchos temporizados |
| Catacumbas de Jade | 7 | Secuencia contrarreloj |
| Bastión Carmesí | 8 | Secuencia contrarreloj |
| Ciudadela de Hielo | 9 | Secuencia contrarreloj |

En cada reino, lee la pista del sello, localiza los pedestales SOL, LUNA y ESTRELLA y actívalos en ese orden acercándote y pulsando E. Un error reinicia la secuencia. La pista cambia entre reinos. En los tres últimos el reloj comienza al activar la primera runa: el plazo se calcula a partir de la distancia real de recorrido y añade margen para esquivar. Si expira, debes comenzar de nuevo.

Resolver el puzle abre la jaula de la llave. Recógela y entra en el portal del siguiente reino. Tras obtener las seis, vuelve al altar B del santuario. No basta con llegar a la última sala.

Al morir vuelves a A, conservando las llaves y los puzles ya resueltos; las secuencias incompletas se reinician. El contador suma una muerte. R borra toda la partida. No hay persistencia después de recargar el navegador.

## Controles y cámara

- WASD o flechas: movimiento en los ejes del mapa; diagonales normalizadas.
- E: interactuar con un pedestal cercano. Mantenerla pulsada no repite acciones.
- V: recorrer las cuatro cámaras. El selector permite elegir perspectiva con seguimiento, perspectiva del mapa completo, cenital del mapa completo y cenital con seguimiento. Las vistas cenitales miran exactamente hacia abajo y mantienen el norte arriba.
- P/Escape: pausa. Salir de la ventana también pausa.
- R: nueva partida.
- Pantalla pequeña: botones táctiles, incluido E.

El minimapa muestra paredes, tu posición, runas, llave y portales. Las runas activadas usan el mismo celeste que en la escena; vuelven al color pendiente si falla o caduca la secuencia. Las puertas cerradas y la llave encerrada se ven grises; se actualizan al desbloquearse y la llave desaparece al recogerla. El aro turquesa identifica a la llama. Los muros tienen volumen y sombras; la cámara cercana sigue a la protagonista suavemente y se recoloca al cambiar de sala. El aumento de tamaño de los objetos cercanos y la reducción de los lejanos provienen de la cámara PerspectiveCamera, sin proyección ortográfica.

Los guardianes patrullan caminos válidos del laberinto, con velocidades crecientes. Los pinchos son seguros en gris, avisan en ámbar y dañan en rojo. Busca cámaras de refugio y usa los laterales de los pasillos para esquivar.

## Código

- `src/App.jsx`: Canvas, KeyboardControls de Drei, interfaz, inventario, pista de puzle y modos de cámara.
- `src/labyrinth.js`: mapas deterministas, BFS, reglas de movimiento, colisiones, inventario, portales, puzles y temporizadores.
- `src/components/Jugador.jsx`: modelo original de la llama y simulación con useFrame/useKeyboardControls.
- `src/components/Laberinto.jsx`: cámara perspectiva, muros, portales, jaulas, runas y trampas.
- `src/components/Obstaculo.jsx`: guardianes reutilizables y patrullas.
- `src/components/MiniMapa.jsx`: orientación en SVG con posición actual.
- `src/components/Marcador.jsx`: tiempo, muertes y progreso.

La simulación usa pasos de hasta 1/120 s para comprobar paredes y enemigos. El tiempo y los peligros se congelan en pausa y al ganar. Las pulsaciones de interacción tienen detección de flanco para no activar múltiples runas al mantener E.

## Verificación

Las pruebas cubren conectividad de las siete zonas, movimiento sin atravesar paredes, patrullas, puertas, llaves, muertes, trampas, victoria, orden de runas, teclas mantenidas y expiración de puzles. La prueba integral camina por todos los objetivos y resuelve cada puzle con su reloj real de simulación. Solo en esa prueba se desactiva el daño para aislar la conectividad y las reglas de progresión; las colisiones se verifican por separado. No representa una evaluación del equilibrio de dificultad por jugadores humanos.

## Defensa y trabajo del equipo

Mostrar el juego, un choque y aumento de muertes, la activación de runas, una puerta y la victoria. Explicar Canvas/useFrame (Fiber), KeyboardControls/useKeyboardControls (Drei), cámara perspectiva y colisiones. Mostrar las ramas, commits y PR reales de cada integrante. La guía académica requiere un video de 2–3 minutos y los enlaces al repositorio y al video. Esta actualización local no publica cambios ni crea participaciones del equipo.
