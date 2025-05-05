# MazeBot - Simulador de Resolución de Laberintos 3D

Una aplicación web tridimensional que simula un entorno de laberinto y un robot autónomo capaz de resolverlo utilizando algoritmos de búsqueda. El sistema permite la carga dinámica de laberintos mediante archivos JSON, facilitando la experimentación con diferentes configuraciones.

MazeBot está diseñado para fomentar la comprensión de conceptos de inteligencia artificial aplicados a entornos virtuales, integrando visualización 3D, simulación de comportamientos inteligentes y estrategias de resolución de problemas. La aplicación se ha desarrollado utilizando HTML, CSS, JS y Three.js y es accesible en cualquier navegador web moderno.

## Características Principales
- Visualización interactiva 3D de algoritmos de resolución de laberintos
- Tres algoritmos de búsqueda de caminos:
  - Búsqueda en Anchura (BFS)
  - Búsqueda en Profundidad (DFS)
  - Búsqueda A*
- Visualización en tiempo real del movimiento del robot
- Controles de cámara para ver desde diferentes ángulos
- Carga de laberintos personalizados mediante archivos JSON
- Seguimiento de estadísticas en tiempo real
- Interfaz intuitiva y responsive

## Tecnologías Utilizadas
- Three.js para renderizado 3D
- JavaScript nativo (ES6+)
- HTML5 y CSS3
- JSON para datos del laberinto
- WebGL para aceleración por hardware

## Estructura del Proyecto
```
IA1_1S2025_P3_G19/
├── LICENSE
├── README.md
├── assets/
│   └── textures/
├── index.html              # Página principal de la aplicación
├── test_robot.html         # Página de pruebas del robot
├── testdos.html           # Página de pruebas adicionales
├── testtres.html          # Página de pruebas avanzadas
├── sample_maze.json       # Ejemplo de laberinto
├── samples/
│   └── mazes/            # Colección de laberintos de ejemplo
│       ├── complex.json
│       ├── facil.json
│       ├── medio.json
│       ├── multiple_paths.json
│       ├── small.json
│       ├── spiral.json
│       └── zigzag.json
├── src/
│   ├── algorithms/       # Implementaciones de algoritmos
│   │   ├── astar.js
│   │   ├── bfs.js
│   │   └── dfs.js
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── config.js
│   │   ├── main.js
│   │   ├── mazeLoader.js
│   │   ├── renderer.js
│   │   ├── robot.js
│   │   └── robotTest.js
│   └── models/          # Modelos 3D
│       ├── Soldier.glb
│       ├── cute_robot_companion_glb.glb
│       └── robot.glb
└── .gitignore
```

## Configuración y Ejecución

### Requisitos Previos
- Navegador web moderno con soporte para WebGL
- Python 3.x (para servidor local) o cualquier servidor web estático

### Pasos de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/gitmedrano/IA1_1S2025_P3_G19.git
   cd IA1_1S2025_P3_G19
   ```

2. Iniciar un servidor local:
   ```bash
   # Usando Python 3
   python -m http.server 5500
   
   # O usando Node.js
   npx serve
   ```

3. Abrir el navegador y navegar a:
   - `http://localhost:5500` (Python)
   - `http://localhost:3000` (Node.js)

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

### Controles Básicos
1. Cargar un archivo de laberinto usando la entrada de archivo
2. Seleccionar un algoritmo de búsqueda
3. Hacer clic en "Iniciar Simulación" para comenzar

### Controles de Cámara
- **Rotar**: Clic izquierdo + arrastrar
- **Desplazar**: Clic derecho + arrastrar
- **Zoom**: Rueda del ratón
- **Reiniciar**: Presionar tecla 'R'

### Estadísticas en Tiempo Real
- Número de pasos dados
- Tiempo transcurrido
- Algoritmo actual en uso
- Tasa de exploración del laberinto

## Desarrollo

### Agregar Nuevos Algoritmos
1. Crear un nuevo archivo en `src/algorithms/`
2. Implementar la clase del algoritmo de búsqueda
3. Agregar la opción del algoritmo en `index.html`
4. Registrar el algoritmo en `main.js`

### Modificar el Laberinto
1. Seguir el formato JSON especificado
2. Asegurar que las paredes estén dentro de los límites
3. Verificar que las posiciones de inicio y fin sean válidas

### Estilización
- Modificar `src/css/styles.css` para cambios en la interfaz
- Actualizar `src/js/config.js` para configuraciones de visualización 3D

## Solución de Problemas

### Problemas Comunes
1. **Pantalla en Blanco**
   - Verificar la consola del navegador para errores
   - Asegurar que WebGL está habilitado
   - Comprobar que todos los archivos se cargan correctamente

2. **Problemas de Carga**
   - Verificar el formato del archivo JSON
   - Comprobar que las dimensiones del laberinto son válidas
   - Asegurar que las posiciones de inicio y fin son accesibles

3. **Problemas de Rendimiento**
   - Reducir el tamaño del laberinto
   - Ajustar configuraciones en config.js
   - Cerrar otras pestañas del navegador

### Compatibilidad con Navegadores
- Chrome (recomendado)
- Firefox
- Safari
- Edge

## Contribuir
1. Hacer fork del repositorio
2. Crear una rama de características (`git checkout -b feature/AmazingFeature`)
3. Realizar los cambios
4. Hacer commit de los cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abrir un Pull Request

## Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto
Para preguntas o sugerencias, por favor abrir un issue en el repositorio.
