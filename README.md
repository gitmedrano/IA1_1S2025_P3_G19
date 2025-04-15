# MazeBot - 3D Maze Solving Simulator

## Project Structure
```
IA1_1S2025_P3_G19/
├── index.html              # Main application entry point
├── src/
│   ├── js/
│   │   ├── config.js      # Configuration settings
│   │   ├── mazeLoader.js  # JSON maze file loader
│   │   ├── renderer.js    # Three.js visualization
│   │   ├── robot.js       # Robot movement and animation
│   │   └── main.js        # Main application logic
│   ├── algorithms/
│   │   ├── bfs.js         # Breadth-First Search implementation
│   │   ├── dfs.js         # Depth-First Search implementation
│   │   └── astar.js       # A* Search implementation
│   └── css/
│       └── styles.css     # Application styling
└── sample_maze.json       # Example maze file
```

## Features
- Interactive 3D visualization of maze solving algorithms
- Three pathfinding algorithms:
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - A* Search
- Real-time visualization of robot movement
- Camera controls for viewing from different angles
- Custom maze loading via JSON files
- Real-time statistics tracking

## Technologies Used
- Three.js for 3D rendering
- Native JavaScript (ES6+)
- HTML5 & CSS3
- JSON for maze data

## Setup and Running
1. Clone the repository
2. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 5500
   ```
3. Open your browser and navigate to `http://localhost:5500`

## Maze File Format
```json
{
    "ancho": 10,    // Width of the maze
    "alto": 10,     // Height of the maze
    "inicio": [0, 0], // Start position [x, y]
    "fin": [9, 9],   // End position [x, y]
    "paredes": [     // Wall positions
        [1, 0],
        [1, 1],
        [1, 2]
        // ... more wall positions
    ]
}
```

## Components

### 1. Main Application (main.js)
- Initializes the application
- Handles user interactions
- Manages the simulation state
- Coordinates between components

### 2. Maze Loader (mazeLoader.js)
- Handles JSON file loading
- Validates maze data
- Dispatches maze loaded events

### 3. Renderer (renderer.js)
- Manages Three.js scene
- Handles 3D visualization
- Controls camera and lighting
- Manages maze rendering

### 4. Robot (robot.js)
- Controls robot movement
- Handles animations
- Manages collision detection

### 5. Search Algorithms
- **BFS (bfs.js)**: Breadth-First Search implementation
  - Explores maze level by level
  - Guarantees shortest path
  - Memory intensive

- **DFS (dfs.js)**: Depth-First Search implementation
  - Explores as far as possible along branches
  - Memory efficient
  - May not find shortest path

- **A* (astar.js)**: A* Search implementation
  - Uses heuristics for intelligent searching
  - Combines BFS efficiency with informed search
  - Generally finds optimal path

## Usage
1. Load a maze file using the file input
2. Select a pathfinding algorithm
3. Click "Start Simulation" to begin
4. Use mouse controls to view the maze:
   - Left click + drag: Rotate
   - Right click + drag: Pan
   - Scroll: Zoom

## Camera Controls
- **Rotate**: Left click + drag
- **Pan**: Right click + drag
- **Zoom**: Mouse wheel
- **Reset**: Press 'R' key

## Statistics
The application shows:
- Number of steps taken
- Time elapsed
- Current algorithm in use

## Development

### Adding New Algorithms
1. Create a new file in `src/algorithms/`
2. Implement the search algorithm class
3. Add the algorithm option in `index.html`
4. Register the algorithm in `main.js`

### Modifying the Maze
1. Follow the JSON format
2. Ensure walls are within bounds
3. Verify start and end positions are valid

### Styling
- Modify `styles.css` for UI changes
- Update `config.js` for 3D visualization settings

## Troubleshooting
- **Blank Screen**: Check browser console for errors
- **Loading Issues**: Verify JSON file format
- **Performance Issues**: Adjust CONFIG settings in config.js

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License.
