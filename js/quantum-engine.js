/**
 * Quantum Visual Learning - Simulation Engine
 * A comprehensive quantum computing simulation library
 */

// ============================================
// COMPLEX NUMBER OPERATIONS
// ============================================

class Complex {
    constructor(real = 0, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    static fromPolar(r, theta) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }

    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    sub(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }

    mul(other) {
        if (typeof other === 'number') {
            return new Complex(this.real * other, this.imag * other);
        }
        return new Complex(
            this.real * other.real - this.imag * other.imag,
            this.real * other.imag + this.imag * other.real
        );
    }

    div(other) {
        if (typeof other === 'number') {
            return new Complex(this.real / other, this.imag / other);
        }
        const denom = other.real * other.real + other.imag * other.imag;
        return new Complex(
            (this.real * other.real + this.imag * other.imag) / denom,
            (this.imag * other.real - this.real * other.imag) / denom
        );
    }

    abs() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }

    phase() {
        return Math.atan2(this.imag, this.real);
    }

    conj() {
        return new Complex(this.real, -this.imag);
    }

    exp() {
        const r = Math.exp(this.real);
        return new Complex(r * Math.cos(this.imag), r * Math.sin(this.imag));
    }

    toString() {
        if (Math.abs(this.imag) < 1e-10) {
            return this.real.toFixed(4);
        }
        if (Math.abs(this.real) < 1e-10) {
            return `${this.imag.toFixed(4)}i`;
        }
        const sign = this.imag >= 0 ? '+' : '-';
        return `${this.real.toFixed(4)} ${sign} ${Math.abs(this.imag).toFixed(4)}i`;
    }

    toPolarString() {
        const r = this.abs();
        const theta = this.phase() * 180 / Math.PI;
        return `r=${r.toFixed(4)}, θ=${theta.toFixed(1)}°`;
    }
}

// ============================================
// QUANTUM STATE VECTOR
// ============================================

class QuantumState {
    constructor(numQubits) {
        this.numQubits = numQubits;
        this.dimension = Math.pow(2, numQubits);
        this.amplitudes = new Array(this.dimension).fill(null).map(() => new Complex(0, 0));
        this.amplitudes[0] = new Complex(1, 0); // Start in |00...0⟩
    }

    reset() {
        this.amplitudes = new Array(this.dimension).fill(null).map(() => new Complex(0, 0));
        this.amplitudes[0] = new Complex(1, 0);
    }

    normalize() {
        let norm = 0;
        for (const amp of this.amplitudes) {
            norm += amp.abs() * amp.abs();
        }
        norm = Math.sqrt(norm);
        if (norm > 1e-10) {
            this.amplitudes = this.amplitudes.map(a => a.div(norm));
        }
    }

    getProbabilities() {
        return this.amplitudes.map(a => a.abs() * a.abs());
    }

    measure() {
        const probs = this.getProbabilities();
        const rand = Math.random();
        let cumsum = 0;

        for (let i = 0; i < probs.length; i++) {
            cumsum += probs[i];
            if (rand < cumsum) {
                this.collapse(i);
                return i;
            }
        }

        this.collapse(probs.length - 1);
        return probs.length - 1;
    }

    collapse(index) {
        for (let i = 0; i < this.amplitudes.length; i++) {
            if (i === index) {
                this.amplitudes[i] = new Complex(1, 0);
            } else {
                this.amplitudes[i] = new Complex(0, 0);
            }
        }
    }

    getBlochAngles() {
        if (this.numQubits !== 1) {
            throw new Error('Bloch sphere only works for single qubit states');
        }

        const alpha = this.amplitudes[0];
        const beta = this.amplitudes[1];

        const theta = 2 * Math.acos(alpha.abs());
        let phi = beta.phase() - alpha.phase();
        if (phi < 0) phi += 2 * Math.PI;

        return { theta, phi };
    }

    toString() {
        let result = '|ψ⟩ = ';
        const terms = [];

        for (let i = 0; i < this.amplitudes.length; i++) {
            const amp = this.amplitudes[i];
            if (amp.abs() > 1e-10) {
                const ket = `|${i.toString(2).padStart(this.numQubits, '0')}⟩`;
                if (amp.abs() > 1e-10) {
                    terms.push(`(${amp.toString()})${ket}`);
                }
            }
        }

        return result + terms.join(' + ');
    }

    toLatex() {
        let result = '';
        for (let i = 0; i < this.amplitudes.length; i++) {
            const amp = this.amplitudes[i];
            if (amp.abs() > 1e-10) {
                const ket = `|${i.toString(2).padStart(this.numQubits, '0')}\\rangle`;
                result += `(${amp.toString()})${ket} + `;
            }
        }
        return result.slice(0, -3);
    }
}

// ============================================
// QUANTUM GATES
// ============================================

const QuantumGates = {
    // Single Qubit Gates
    I: [[1, 0], [0, 1]], // Identity

    H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]], // Hadamard

    X: [[0, 1], [1, 0]], // Pauli-X (NOT)
    Y: [[0, -1], [1, 0]].map(row => row.map(x => new Complex(0, x))), // Pauli-Y
    Z: [[1, 0], [0, -1]], // Pauli-Z

    S: [[1, 0], [0, 1j]], // Phase gate
    T: [[1, 0], [0, Math.exp(1j * Math.PI / 4)]], // T gate (π/8)

    // Rotation gates
    Rx: (theta) => [
        [Math.cos(theta/2), -1j*Math.sin(theta/2)],
        [-1j*Math.sin(theta/2), Math.cos(theta/2)]
    ],

    Ry: (theta) => [
        [Math.cos(theta/2), -Math.sin(theta/2)],
        [Math.sin(theta/2), Math.cos(theta/2)]
    ],

    Rz: (theta) => [
        [Math.exp(-1j*theta/2), 0],
        [0, Math.exp(1j*theta/2)]
    ],

    // Two-Qubit Gates
    CNOT: (control, target, numQubits) => {
        const dim = Math.pow(2, numQubits);
        const matrix = [];

        for (let i = 0; i < dim; i++) {
            const row = new Array(dim).fill(null).map(() => new Complex(0, 0));
            const controlBit = (i >> control) & 1;

            if (controlBit === 1) {
                const flipped = i ^ (1 << target);
                row[flipped] = new Complex(1, 0);
            } else {
                row[i] = new Complex(1, 0);
            }
            matrix.push(row);
        }

        return matrix;
    },

    CZ: (control, target, numQubits) => {
        const dim = Math.pow(2, numQubits);
        const matrix = [];

        for (let i = 0; i < dim; i++) {
            const row = new Array(dim).fill(null).map(() => new Complex(0, 0));
            row[i] = new Complex(1, 0);

            const controlBit = (i >> control) & 1;
            const targetBit = (i >> target) & 1;

            if (controlBit === 1 && targetBit === 1) {
                row[i] = new Complex(-1, 0);
            }
            matrix.push(row);
        }

        return matrix;
    },

    SWAP: (q1, q2, numQubits) => {
        const dim = Math.pow(2, numQubits);
        const matrix = [];

        for (let i = 0; i < dim; i++) {
            const row = new Array(dim).fill(null).map(() => new Complex(0, 0));

            const bit1 = (i >> q1) & 1;
            const bit2 = (i >> q2) & 1;

            let j = i;
            j ^= (1 << q1) * bit1;
            j ^= (1 << q2) * bit2;
            j |= (1 << q1) * bit2;
            j |= (1 << q2) * bit1;

            row[j] = new Complex(1, 0);
            matrix.push(row);
        }

        return matrix;
    },

    // Three-Qubit Gate
    Toffoli: (c1, c2, target, numQubits) => {
        const dim = Math.pow(2, numQubits);
        const matrix = [];

        for (let i = 0; i < dim; i++) {
            const row = new Array(dim).fill(null).map(() => new Complex(0, 0));

            const bit1 = (i >> c1) & 1;
            const bit2 = (i >> c2) & 1;

            if (bit1 === 1 && bit2 === 1) {
                const flipped = i ^ (1 << target);
                row[flipped] = new Complex(1, 0);
            } else {
                row[i] = new Complex(1, 0);
            }
            matrix.push(row);
        }

        return matrix;
    }
};

// ============================================
// QUANTUM CIRCUIT SIMULATOR
// ============================================

class QuantumCircuit {
    constructor(numQubits) {
        this.numQubits = numQubits;
        this.state = new QuantumState(numQubits);
        this.gates = [];
        this.gateHistory = [];
    }

    reset() {
        this.state.reset();
        this.gateHistory = [];
    }

    addGate(gateName, target, control = null, control2 = null) {
        this.gates.push({ gateName, target, control, control2 });
    }

    applyGate(gateMatrix, target) {
        const newAmplitudes = new Array(this.state.dimension).fill(null).map(() => new Complex(0, 0));

        for (let i = 0; i < this.state.dimension; i++) {
            const bit = (i >> target) & 1;

            for (let j = 0; j < 2; j++) {
                const newBit = j;
                let mask = (newBit << target);
                let otherBits = i & ~(1 << target);
                let idx = mask | otherBits;

                newAmplitudes[idx] = newAmplitudes[idx].add(
                    this.state.amplitudes[i].mul(gateMatrix[bit][j])
                );
            }
        }

        this.state.amplitudes = newAmplitudes;
    }

    applyTwoQubitGate(gateMatrix, control, target) {
        const newAmplitudes = new Array(this.state.dimension).fill(null).map(() => new Complex(0, 0));

        for (let i = 0; i < this.state.dimension; i++) {
            const controlBit = (i >> control) & 1;
            const targetBit = (i >> target) & 1;

            // Apply transformation based on control bit
            if (controlBit === 1) {
                // Apply the gate matrix
                for (let j = 0; j < 2; j++) {
                    const newTargetBit = j;
                    let flipped = i;
                    if (newTargetBit !== targetBit) {
                        flipped = i ^ (1 << target);
                    }

                    // Get the matrix element
                    const matrixRow = targetBit;
                    const matrixCol = newTargetBit;

                    newAmplitudes[flipped] = newAmplitudes[flipped].add(
                        this.state.amplitudes[i].mul(gateMatrix[matrixRow][matrixCol])
                    );
                }
            } else {
                newAmplitudes[i] = this.state.amplitudes[i];
            }
        }

        this.state.amplitudes = newAmplitudes;
    }

    execute() {
        this.state.reset();

        for (const gate of this.gates) {
            const { gateName, target, control, control2 } = gate;

            switch (gateName) {
                case 'H':
                case 'X':
                case 'Y':
                case 'Z':
                case 'S':
                case 'T':
                    this.applyGate(QuantumGates[gateName], target);
                    break;

                case 'Rx':
                    this.applyGate(QuantumGates.Rx(Math.PI/4), target);
                    break;
                case 'Ry':
                    this.applyGate(QuantumGates.Ry(Math.PI/4), target);
                    break;
                case 'Rz':
                    this.applyGate(QuantumGates.Rz(Math.PI/4), target);
                    break;

                case 'CNOT':
                    if (control !== null) {
                        this.applyTwoQubitGate(QuantumGates.CNOT(0, 1, 2), control, target);
                    }
                    break;

                // Add more gates as needed
            }

            this.gateHistory.push({ ...gate });
        }

        this.state.normalize();
        return this.state;
    }

    run(shots = 1000) {
        const results = {};
        const probs = this.state.getProbabilities();

        for (let i = 0; i < shots; i++) {
            // Reset to initial state
            this.state.reset();

            // Execute circuit again for each shot
            for (const gate of this.gates) {
                const { gateName, target, control } = gate;

                switch (gateName) {
                    case 'H':
                    case 'X':
                    case 'Y':
                    case 'Z':
                    case 'S':
                    case 'T':
                        this.applyGate(QuantumGates[gateName], target);
                        break;

                    case 'CNOT':
                        if (control !== null) {
                            this.applyTwoQubitGate(QuantumGates.CNOT(0, 1, 2), control, target);
                        }
                        break;
                }
            }

            this.state.normalize();

            // Measure
            const outcome = this.state.measure();
            const key = outcome.toString(2).padStart(this.numQubits, '0');

            if (results[key]) {
                results[key]++;
            } else {
                results[key] = 1;
            }
        }

        return {
            counts: results,
            probabilities: probs,
            state: this.state.amplitudes
        };
    }
}

// ============================================
// QUANTUM ALGORITHMS
// ============================================

const QuantumAlgorithms = {
    // Deutsch-Jozsa Algorithm
    deutschJozsa: (oracleType, numQubits = 2) => {
        const circuit = new QuantumCircuit(numQubits);

        // Initialize |0...01⟩ (extra qubit for oracle output)
        circuit.state.amplitudes = new Array(Math.pow(2, numQubits + 1))
            .fill(null).map(() => new Complex(0, 0));
        circuit.state.amplitudes[1] = new Complex(1, 0);
        circuit.state.numQubits = numQubits + 1;
        circuit.state.dimension = Math.pow(2, numQubits + 1);

        // Apply Hadamard to all qubits
        for (let i = 0; i <= numQubits; i++) {
            circuit.applyGate(QuantumGates.H, i);
        }

        // Apply Oracle (simplified)
        if (oracleType === 'balanced') {
            // For balanced: flip output qubit when first input qubit is 1
            for (let i = 0; i < circuit.state.dimension; i++) {
                if ((i >> numQubits) & 1) {
                    const flipped = i ^ 1;
                    const temp = circuit.state.amplitudes[i];
                    circuit.state.amplitudes[i] = circuit.state.amplitudes[flipped];
                    circuit.state.amplitudes[flipped] = temp;
                }
            }
        }

        // Apply Hadamard to input qubits (not output)
        for (let i = 0; i < numQubits; i++) {
            circuit.applyGate(QuantumGates.H, i);
        }

        // Measure first n qubits
        let result = 0;
        for (let i = 0; i < Math.pow(2, numQubits); i++) {
            if (circuit.state.amplitudes[i].abs() > 0.1) {
                result = i;
                break;
            }
        }

        return {
            result: result === 0 ? 'CONSTANT' : 'BALANCED',
            state: circuit.state
        };
    },

    // Grover's Search Algorithm
    groversSearch: (markedItem, numQubits = 3, iterations = null) => {
        const dim = Math.pow(2, numQubits);
        const N = dim;
        const optimalIterations = Math.floor(Math.PI / (4 * Math.asin(1 / Math.sqrt(N))));
        const numIterations = iterations || optimalIterations;

        const circuit = new QuantumCircuit(numQubits);

        // Initial superposition
        for (let i = 0; i < numQubits; i++) {
            circuit.applyGate(QuantumGates.H, i);
        }

        // Grover iterations
        for (let iter = 0; iter < numIterations; iter++) {
            // Oracle: flip phase of marked state
            for (let i = 0; i < circuit.state.dimension; i++) {
                if (i === markedItem) {
                    circuit.state.amplitudes[i] = circuit.state.amplitudes[i].mul(-1);
                }
            }

            // Diffusion operator
            // Apply H to all qubits
            for (let i = 0; i < numQubits; i++) {
                circuit.applyGate(QuantumGates.H, i);
            }

            // Apply Z with control (simplified diffusion)
            for (let i = 0; i < circuit.state.dimension; i++) {
                if (i !== 0) {
                    circuit.state.amplitudes[i] = circuit.state.amplitudes[i].mul(-1);
                }
            }

            // Apply H again
            for (let i = 0; i < numQubits; i++) {
                circuit.applyGate(QuantumGates.H, i);
            }
        }

        return {
            state: circuit.state,
            optimalIterations: numIterations
        };
    },

    // Bell State Generation
    bellState: (type = 0) => {
        const circuit = new QuantumCircuit(2);

        // Create superposition
        circuit.applyGate(QuantumGates.H, 0);

        // CNOT with q[0] as control
        circuit.applyTwoQubitGate([[0, 1], [1, 0]], 0, 1);

        // Optional rotations for different Bell states
        if (type === 1) {
            circuit.applyGate(QuantumGates.Z, 0);
        } else if (type === 2) {
            circuit.applyGate(QuantumGates.X, 0);
        } else if (type === 3) {
            circuit.applyGate(QuantumGates.X, 0);
            circuit.applyGate(QuantumGates.Z, 0);
        }

        return {
            state: circuit.state,
            bellState: ['|Φ+⟩', '|Φ-⟩', '|Ψ+⟩', '|Ψ-⟩'][type],
            formula: ['(|00⟩ + |11⟩)/√2', '(|00⟩ - |11⟩)/√2', '(|01⟩ + |10⟩)/√2', '(|01⟩ - |10⟩)/√2'][type]
        };
    },

    // GHZ State
    ghzState: (numQubits) => {
        const circuit = new QuantumCircuit(numQubits);

        // Apply Hadamard to first qubit
        circuit.applyGate(QuantumGates.H, 0);

        // Apply CNOT from q[0] to all other qubits
        for (let i = 1; i < numQubits; i++) {
            circuit.applyTwoQubitGate([[0, 1], [1, 0]], 0, i);
        }

        return {
            state: circuit.state,
            formula: `(|0...0⟩ + |1...1⟩)/√2`
        };
    },

    // Quantum Teleportation Circuit
    teleportation: (initialState = null) => {
        const circuit = new QuantumCircuit(3);

        // Qubit 0: Alice's data qubit (optional initial state)
        if (initialState) {
            circuit.applyGate(QuantumGates.H, 0);
            circuit.applyGate(QuantumGates.S, 0);
        }

        // Qubit 1 & 2: Bell pair (entangled)
        circuit.applyGate(QuantumGates.H, 1);
        circuit.applyTwoQubitGate([[0, 1], [1, 0]], 1, 2);

        // Bell state measurement on qubits 0 and 1
        circuit.applyTwoQubitGate([[0, 1], [1, 0]], 0, 1);
        circuit.applyGate(QuantumGates.H, 0);

        // Classical communication and correction
        // (In simulation, we can apply corrections directly)

        return {
            state: circuit.state,
            message: 'Qubit 0 teleported to Qubit 2'
        };
    },

    // Quantum Fourier Transform
    qft: (numQubits) => {
        const circuit = new QuantumCircuit(numQubits);

        for (let i = 0; i < numQubits; i++) {
            // Hadamard
            circuit.applyGate(QuantumGates.H, i);

            // Controlled rotations
            for (let j = i + 1; j < numQubits; j++) {
                const theta = Math.PI / Math.pow(2, j - i);
                // Simplified: apply Rz equivalent phase
                const phaseGate = [[1, 0], [0, Math.exp(1j * theta)]];
                circuit.applyTwoQubitGate(phaseGate, j, i);
            }
        }

        return {
            state: circuit.state,
            description: 'Quantum Fourier Transform'
        };
    }
};

// ============================================
// VISUALIZATION HELPERS
// ============================================

const QuantumVisualizer = {
    // Create SVG Bloch sphere
    createBlochSVG: (containerId, width = 300, height = 300) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '-150 -150 300 300');

        // Sphere outline
        const sphere = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sphere.setAttribute('cx', '0');
        sphere.setAttribute('cy', '0');
        sphere.setAttribute('r', '100');
        sphere.setAttribute('fill', 'none');
        sphere.setAttribute('stroke', '#00d4ff');
        sphere.setAttribute('stroke-width', '2');
        sphere.setAttribute('opacity', '0.3');
        svg.appendChild(sphere);

        // Axes
        const axes = [
            { x1: -110, y1: 0, x2: 110, y2: 0 },
            { x1: 0, y1: -110, x2: 0, y2: 110 }
        ];

        axes.forEach(axis => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            Object.keys(axis).forEach(attr => line.setAttribute(attr, axis[attr]));
            line.setAttribute('stroke', '#fff');
            line.setAttribute('opacity', '0.2');
            svg.appendChild(line);
        });

        // Labels
        const labels = [
            { text: '|0⟩', x: 0, y: -120 },
            { text: '|1⟩', x: 0, y: 120 },
            { text: '+X', x: 110, y: 10 },
            { text: '-X', x: -110, y: 10 }
        ];

        labels.forEach(label => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', label.x);
            text.setAttribute('y', label.y);
            text.setAttribute('fill', '#00d4ff');
            text.setAttribute('font-family', 'Orbitron');
            text.setAttribute('font-size', '14');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = label.text;
            svg.appendChild(text);
        });

        // State vector line
        const stateLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stateLine.setAttribute('id', 'bloch-vector');
        stateLine.setAttribute('x1', '0');
        stateLine.setAttribute('y1', '0');
        stateLine.setAttribute('x2', '0');
        stateLine.setAttribute('y2', '-80');
        stateLine.setAttribute('stroke', '#a855f7');
        stateLine.setAttribute('stroke-width', '3');
        svg.appendChild(stateLine);

        // State vector arrow head
        const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrowHead.setAttribute('id', 'bloch-arrowhead');
        arrowHead.setAttribute('points', '0,-85 -5,-75 5,-75');
        arrowHead.setAttribute('fill', '#a855f7');
        svg.appendChild(arrowHead);

        container.innerHTML = '';
        container.appendChild(svg);

        return {
            update: (theta, phi) => {
                const x = 80 * Math.sin(theta) * Math.cos(phi);
                const y = -80 * Math.cos(theta);
                const z = 80 * Math.sin(theta) * Math.sin(phi);

                stateLine.setAttribute('x2', x);
                stateLine.setAttribute('y2', y);

                // Update arrow head position and rotation
                const angle = Math.atan2(z, x) * 180 / Math.PI - 90;
                arrowHead.setAttribute('transform', `translate(${x}, ${y}) rotate(${angle})`);
            }
        };
    },

    // Create probability bar chart
    createProbabilityChart: (containerId, probabilities, labels) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const maxProb = Math.max(...probabilities);

        probabilities.forEach((prob, i) => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                display: flex;
                align-items: center;
                margin: 0.5rem 0;
            `;

            const labelDiv = document.createElement('div');
            labelDiv.style.cssText = `
                width: 80px;
                font-family: 'Times New Roman', serif;
                color: #00d4ff;
            `;
            labelDiv.textContent = labels[i] || `|${i.toString(2)}⟩`;

            const barContainer = document.createElement('div');
            barContainer.style.cssText = `
                flex: 1;
                height: 30px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
                overflow: hidden;
                margin: 0 1rem;
            `;

            const fill = document.createElement('div');
            fill.style.cssText = `
                height: 100%;
                width: ${(prob / maxProb) * 100}%;
                background: linear-gradient(90deg, #00d4ff, #a855f7);
                transition: width 0.5s ease;
            `;
            fill.textContent = ` ${(prob * 100).toFixed(1)}%`;

            const valueDiv = document.createElement('div');
            valueDiv.style.cssText = `
                width: 80px;
                font-family: 'Orbitron', monospace;
                color: rgba(255, 255, 255, 0.8);
            `;
            valueDiv.textContent = (prob * 100).toFixed(1) + '%';

            barContainer.appendChild(fill);
            bar.appendChild(labelDiv);
            bar.appendChild(barContainer);
            bar.appendChild(valueDiv);
            container.appendChild(bar);
        });
    },

    // Create state vector display
    createStateVectorDisplay: (containerId, amplitudes, numQubits) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<h4 style="text-align: center; color: #a855f7; margin-bottom: 1rem;">State Vector</h4>';

        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        `;

        // Header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background: rgba(0, 212, 255, 0.1);">
                <th style="padding: 0.5rem; text-align: left; color: #00d4ff; font-family: Orbitron;">State</th>
                <th style="padding: 0.5rem; text-align: left; color: #00d4ff; font-family: Orbitron;">Amplitude</th>
                <th style="padding: 0.5rem; text-align: left; color: #00d4ff; font-family: Orbitron;">|Amplitude|²</th>
                <th style="padding: 0.5rem; text-align: left; color: #00d4ff; font-family: Orbitron;">Phase</th>
            </tr>
        `;
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        for (let i = 0; i < amplitudes.length; i++) {
            const amp = amplitudes[i];
            const prob = amp.abs() * amp.abs();
            const phase = amp.phase() * 180 / Math.PI;

            const row = document.createElement('tr');
            row.style.cssText = `
                border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            `;

            if (prob > 0.01) {
                row.style.background = 'rgba(168, 85, 247, 0.1)';
            }

            row.innerHTML = `
                <td style="padding: 0.5rem; font-family: 'Times New Roman', serif;">|${i.toString(2).padStart(numQubits, '0')}⟩</td>
                <td style="padding: 0.5rem; font-family: 'Times New Roman', serif; color: ${prob > 0.01 ? '#a855f7' : 'rgba(255,255,255,0.3)'}">${amp.toString()}</td>
                <td style="padding: 0.5rem; font-family: 'Orbitron';">${(prob * 100).toFixed(2)}%</td>
                <td style="padding: 0.5rem; font-family: 'Orbitron';">${phase.toFixed(1)}°</td>
            `;
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        container.appendChild(table);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Complex,
        QuantumState,
        QuantumGates,
        QuantumCircuit,
        QuantumAlgorithms,
        QuantumVisualizer
    };
}
