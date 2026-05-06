# Quantum Visual Learning - Project Documentation

## Overview
An interactive, comprehensive tutorial platform for learning quantum computing through visualization and hands-on experimentation.

## Project Structure
```
Quantum_visual_learning/
├── index.html           # Main tutorial application
├── glossary.html       # Quantum computing terminology
├── exercises.html      # Practice problems and quizzes
├── README.md           # Project overview
├── css/
│   └── styles.css      # Additional styling
├── js/
│   └── quantum-engine.js # Core quantum simulation library
└── CLAUDE.md           # This file
```

## Features

### 1. Interactive Circuit Simulator
- Drag-and-drop quantum gates (H, X, Y, Z, CNOT, etc.)
- Real-time circuit execution visualization
- Probability distribution display
- Multiple qubit support (1-4 qubits)

### 2. Bloch Sphere Visualization
- 3D interactive sphere using Three.js
- Real-time rotation as gates are applied
- Slider controls for θ and φ angles

### 3. State Vector Display
- Live quantum state representation
- Complex amplitude visualization
- Phase information display

### 4. Quantum Algorithms Demo
- Deutsch-Jozsa Algorithm
- Grover's Search Algorithm
- Quantum Fourier Transform
- Phase Estimation

### 5. Educational Content
- Step-by-step tutorials
- Concept cards with visualizations
- Interactive demonstrations
- Practice exercises and quizzes

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js (r128)
- **Fonts**: Orbitron, Rajdhani (Google Fonts)
- **No build step required** - runs directly in browser

## How to Use

### Running Locally
1. Clone the repository
2. Open `index.html` in a modern web browser
3. No server required - works with file:// protocol

### Building Custom Circuits
1. Select number of qubits (1-4)
2. Click gates from the palette to add them
3. Click "Run Circuit" to simulate
4. View results in Bloch sphere and state vector

### Pre-built Examples
- Bell State: Creates maximally entangled pair
- GHZ State: Multi-qubit entanglement
- Teleportation: Quantum state transfer
- Superposition: Basic superposition demo

## Quantum Simulation Engine

The `quantum-engine.js` file contains a complete simulation library:

### Classes
- `Complex`: Complex number arithmetic
- `QuantumState`: State vector management
- `QuantumCircuit`: Circuit builder and executor
- `QuantumGates`: Gate definitions
- `QuantumAlgorithms`: Algorithm implementations

### Usage Example
```javascript
// Create a 2-qubit circuit
const circuit = new QuantumCircuit(2);

// Add gates
circuit.addGate('H', 0);  // Hadamard on qubit 0
circuit.addGate('CNOT', 1, 0);  // CNOT with control 0, target 1

// Execute
const result = circuit.execute();
console.log(result.toString());
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for Bloch sphere visualization.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License

## Author
Mallikarjuna Sunkara
GitHub: sunkaramallikarjuna369
