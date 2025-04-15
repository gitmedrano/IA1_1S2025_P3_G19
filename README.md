# MazeBot - 3D Maze Solving Simulator

A web-based 3D maze solving simulator that demonstrates various pathfinding algorithms using Three.js for visualization.

## Features

- Interactive 3D visualization of maze solving algorithms
- Support for multiple pathfinding algorithms:
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - A* Search
- Animated robot movement through the maze
- Real-time statistics tracking
- Custom maze loading via JSON files
- Responsive design

## Getting Started

### Prerequisites

- A modern web browser with WebGL support
- Local development server (recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mazebot.git
cd mazebot
```

2. Start a local server. You can use Python's built-in server:
```bash
# Python 3
python -m http.server 8000
```

3. Open your browser and navigate to `http://localhost:8000`

## Usage

1. Load a maze by clicking the file input button and selecting a JSON maze file
2. Select a pathfinding algorithm from the dropdown menu
3. Click "Start Simulation" to begin the maze solving process
4. Use the mouse to rotate and zoom the 3D view:
   - Left click + drag to rotate
   - Right click + drag to pan
   - Scroll to zoom

## Maze File Format

Mazes are defined in JSON format with the following structure:

```json
{
    "ancho": 5,
    "alto": 5,
    "inicio": [0, 0],
    "fin": [4, 4],
    "paredes": [
        [0, 1],
        [1, 1],
        [2, 1]
    ]
}
```

- `ancho`: Width of the maze
- `alto`: Height of the maze
- `inicio`: Starting position [x, y]
- `fin`: Goal position [x, y]
- `paredes`: Array of wall positions [x, y]

## Algorithm Details

### Breadth-First Search (BFS)
- Explores the maze level by level
- Guarantees the shortest path
- Good for unweighted graphs
- Memory intensive

### Depth-First Search (DFS)
- Explores as far as possible along each branch
- May not find the shortest path
- Memory efficient
- Good for maze generation

### A* Search
- Uses heuristics to guide the search
- Guarantees the shortest path
- More efficient than BFS for most cases
- Uses Manhattan distance as heuristic

## Technical Architecture

### Components

- `MazeApp`: Main application controller
- `MazeLoader`: Handles JSON file loading and validation
- `MazeRenderer`: Manages Three.js scene and visualization
- `Robot`: Controls robot movement and animation
- Search Algorithms: Separate implementations for each algorithm

### Technologies Used

- Three.js for 3D rendering
- Native JavaScript (ES6+)
- HTML5 File API
- CSS3 for styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
