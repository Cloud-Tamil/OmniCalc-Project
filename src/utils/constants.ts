export interface ScientificConstant {
  symbol: string;
  name: string;
  category: 'Math' | 'Physics' | 'Universal';
  value: number;
  unit: string;
  description: string;
}

export const SCIENTIFIC_CONSTANTS: ScientificConstant[] = [
  {
    symbol: 'π',
    name: 'Pi',
    category: 'Math',
    value: Math.PI,
    unit: '',
    description: 'Ratio of a circle’s circumference to diameter (~3.14159)',
  },
  {
    symbol: 'e',
    name: "Euler's Number",
    category: 'Math',
    value: Math.E,
    unit: '',
    description: 'Base of natural logarithms (~2.71828)',
  },
  {
    symbol: 'φ',
    name: 'Golden Ratio',
    category: 'Math',
    value: 1.618033988749895,
    unit: '',
    description: 'Divine proportion, (1 + √5)/2 (~1.61803)',
  },
  {
    symbol: 'c',
    name: 'Speed of Light',
    category: 'Physics',
    value: 299792458,
    unit: 'm/s',
    description: 'Speed of light in vacuum (299,792,458 m/s)',
  },
  {
    symbol: 'h',
    name: "Planck's Constant",
    category: 'Physics',
    value: 6.62607015e-34,
    unit: 'J·s',
    description: 'Quantum action fundamental constant',
  },
  {
    symbol: 'G',
    name: 'Gravitational Constant',
    category: 'Physics',
    value: 6.6743e-11,
    unit: 'm³/(kg·s²)',
    description: 'Newtonian constant of gravitation',
  },
  {
    symbol: 'k_B',
    name: "Boltzmann's Constant",
    category: 'Physics',
    value: 1.380649e-23,
    unit: 'J/K',
    description: 'Relates temperature to particle energy',
  },
  {
    symbol: 'N_A',
    name: "Avogadro's Number",
    category: 'Universal',
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    description: 'Number of constituent particles in one mole',
  },
  {
    symbol: 'g',
    name: 'Standard Gravity',
    category: 'Physics',
    value: 9.80665,
    unit: 'm/s²',
    description: 'Earth nominal surface gravity (~9.81 m/s²)',
  },
];
