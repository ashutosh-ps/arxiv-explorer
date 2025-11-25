import React from 'react';
import {
  Bot,
  Brain,
  Eye,
  MessageSquare,
  Lock,
  BarChart3,
  Atom,
  Hash,
  Zap,
  Sparkles,
  TrendingUp,
  DollarSign,
  Dna,
  Network,
  Cpu
} from 'lucide-react';

export const categories = [
  {
    id: 'cs.AI',
    name: 'Artificial Intelligence',
    description: 'AI, machine learning, neural networks',
    color: '#FF6B6B',
    icon: <Bot size={24} />
  },
  {
    id: 'cs.LG',
    name: 'Machine Learning',
    description: 'Learning algorithms, data mining',
    color: '#4ECDC4',
    icon: <Brain size={24} />
  },
  {
    id: 'cs.CV',
    name: 'Computer Vision',
    description: 'Image processing, pattern recognition',
    color: '#45B7D1',
    icon: <Eye size={24} />
  },
  {
    id: 'cs.CL',
    name: 'Computation and Language',
    description: 'NLP, text processing, linguistics',
    color: '#96CEB4',
    icon: <MessageSquare size={24} />
  },
  {
    id: 'cs.CR',
    name: 'Cryptography',
    description: 'Security, encryption, privacy',
    color: '#FFEAA7',
    icon: <Lock size={24} />
  },
  {
    id: 'cs.DS',
    name: 'Data Structures',
    description: 'Algorithms, computational complexity',
    color: '#DFE6E9',
    icon: <BarChart3 size={24} />
  },
  {
    id: 'quant-ph',
    name: 'Quantum Physics',
    description: 'Quantum mechanics, quantum computing',
    color: '#A29BFE',
    icon: <Atom size={24} />
  },
  {
    id: 'math.NT',
    name: 'Number Theory',
    description: 'Prime numbers, algebraic structures',
    color: '#FD79A8',
    icon: <Hash size={24} />
  },
  {
    id: 'physics.gen-ph',
    name: 'General Physics',
    description: 'Classical mechanics, thermodynamics',
    color: '#74B9FF',
    icon: <Zap size={24} />
  },
  {
    id: 'astro-ph',
    name: 'Astrophysics',
    description: 'Cosmology, galaxies, stars',
    color: '#6C5CE7',
    icon: <Sparkles size={24} />
  },
  {
    id: 'stat.ML',
    name: 'Statistics - ML',
    description: 'Statistical learning, inference',
    color: '#00B894',
    icon: <TrendingUp size={24} />
  },
  {
    id: 'econ',
    name: 'Economics',
    description: 'Economic theory, econometrics',
    color: '#FDCB6E',
    icon: <DollarSign size={24} />
  },
  {
    id: 'q-bio',
    name: 'Quantitative Biology',
    description: 'Bioinformatics, systems biology',
    color: '#55EFC4',
    icon: <Dna size={24} />
  },
  {
    id: 'cs.NE',
    name: 'Neural Networks',
    description: 'Deep learning, architectures',
    color: '#FF7675',
    icon: <Network size={24} />
  },
  {
    id: 'cs.RO',
    name: 'Robotics',
    description: 'Autonomous systems, control',
    color: '#636E72',
    icon: <Bot size={24} />
  },
  {
    id: 'cs.SE',
    name: 'Software Engineering',
    description: 'Development, testing, maintenance',
    color: '#00CEC9',
    icon: <Cpu size={24} />
  }
];

export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryColor = (id) => {
  const category = getCategoryById(id);
  return category ? category.color : '#667eea';
};
