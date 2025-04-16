# MazeBot - Simulador de Resolución de Laberintos 3D

## Estructura del Proyecto
```
IA1_1S2025_P3_G19/
├── index.html              # Punto de entrada principal de la aplicación
├── src/
│   ├── js/
│   │   ├── config.js      # Configuraciones
│   │   ├── mazeLoader.js  # Cargador de archivos JSON del laberinto
│   │   ├── renderer.js    # Visualización con Three.js
│   │   ├── robot.js       # Movimiento y animación del robot
│   │   └── main.js        # Lógica principal de la aplicación
│   ├── algorithms/
│   │   ├── bfs.js         # Implementación de Búsqueda en Anchura
│   │   ├── dfs.js         # Implementación de Búsqueda en Profundidad
│   │   └── astar.js       # Implementación de Búsqueda A*
│   └── css/
│       └── styles.css     # Estilos de la aplicación
└── sample_maze.json       # Archivo de ejemplo del laberinto
```

## Características
- Visualización interactiva 3D de algoritmos de resolución de laberintos
- Tres algoritmos de búsqueda de caminos:
  - Búsqueda en Anchura (BFS)
  - Búsqueda en Profundidad (DFS)
  - Búsqueda A*
- Visualización en tiempo real del movimiento del robot
- Controles de cámara para ver desde diferentes ángulos
- Carga de laberintos personalizados mediante archivos JSON
- Seguimiento de estadísticas en tiempo real

## Tecnologías Utilizadas
- Three.js para renderizado 3D
- JavaScript nativo (ES6+)
- HTML5 y CSS3
- JSON para datos del laberinto

## Configuración y Ejecución
1. Clonar el repositorio
2. Iniciar un servidor local:
   ```bash
   # Usando Python 3
   python -m http.server 5500
   ```
3. Abrir el navegador y navegar a `http://localhost:5500`

## Formato del Archivo del Laberinto
```json
{
    "ancho": 10,    // Ancho del laberinto
    "alto": 10,     // Alto del laberinto
    "inicio": [0, 0], // Posición inicial [x, y]
    "fin": [9, 9],   // Posición final [x, y]
    "paredes": [     // Posiciones de las paredes
        [1, 0],
        [1, 1],
        [1, 2]
        // ... más posiciones de paredes
    ]
}
```

## Componentes

### 1. Aplicación Principal (main.js)
- Inicializa la aplicación
- Maneja las interacciones del usuario
- Gestiona el estado de la simulación
- Coordina entre componentes

### 2. Cargador de Laberinto (mazeLoader.js)
- Maneja la carga de archivos JSON
- Valida los datos del laberinto
- Despacha eventos de carga del laberinto

### 3. Renderizador (renderer.js)
- Gestiona la escena de Three.js
- Maneja la visualización 3D
- Controla la cámara e iluminación
- Gestiona el renderizado del laberinto

### 4. Robot (robot.js)
- Controla el movimiento del robot
- Maneja las animaciones
- Gestiona la detección de colisiones

### 5. Algoritmos de Búsqueda
- **BFS (bfs.js)**: Implementación de Búsqueda en Anchura
  - Explora el laberinto nivel por nivel
  - Garantiza el camino más corto
  - Intensivo en memoria

- **DFS (dfs.js)**: Implementación de Búsqueda en Profundidad
  - Explora lo más lejos posible a lo largo de las ramas
  - Eficiente en memoria
  - Puede no encontrar el camino más corto

- **A* (astar.js)**: Implementación de Búsqueda A*
  - Utiliza heurísticas para búsqueda inteligente
  - Combina la eficiencia de BFS con búsqueda informada
  - Generalmente encuentra el camino óptimo

## Uso
1. Cargar un archivo de laberinto usando la entrada de archivo
2. Seleccionar un algoritmo de búsqueda
3. Hacer clic en "Iniciar Simulación" para comenzar
4. Usar controles del ratón para ver el laberinto:
   - Clic izquierdo + arrastrar: Rotar
   - Clic derecho + arrastrar: Desplazar
   - Desplazamiento: Zoom

## Controles de Cámara
- **Rotar**: Clic izquierdo + arrastrar
- **Desplazar**: Clic derecho + arrastrar
- **Zoom**: Rueda del ratón
- **Reiniciar**: Presionar tecla 'R'

## Estadísticas
La aplicación muestra:
- Número de pasos dados
- Tiempo transcurrido
- Algoritmo actual en uso

## Desarrollo

### Agregar Nuevos Algoritmos
1. Crear un nuevo archivo en `src/algorithms/`
2. Implementar la clase del algoritmo de búsqueda
3. Agregar la opción del algoritmo en `index.html`
4. Registrar el algoritmo en `main.js`

### Modificar el Laberinto
1. Seguir el formato JSON
2. Asegurar que las paredes estén dentro de los límites
3. Verificar que las posiciones de inicio y fin sean válidas

### Estilización
- Modificar `styles.css` para cambios en la interfaz
- Actualizar `config.js` para configuraciones de visualización 3D

## Solución de Problemas
- **Pantalla en Blanco**: Revisar la consola del navegador para errores
- **Problemas de Carga**: Verificar el formato del archivo JSON
- **Problemas de Rendimiento**: Ajustar configuraciones en config.js

## Compatibilidad con Navegadores
- Chrome (recomendado)
- Firefox
- Safari
- Edge

## Contribuir
1. Hacer fork del repositorio
2. Crear una rama de características
3. Realizar los cambios
4. Enviar un pull request

## Licencia
Este proyecto está licenciado bajo la Licencia MIT.
