// Complete arXiv Category Taxonomy
// Source: https://arxiv.org/category_taxonomy

// Category groups with their colors
const GROUP_COLORS = {
  'Computer Science': '#FF6B6B',
  'Economics': '#FDCB6E',
  'Electrical Engineering': '#00CEC9',
  'Mathematics': '#A29BFE',
  'Astrophysics': '#6C5CE7',
  'Condensed Matter': '#74B9FF',
  'General Relativity': '#636E72',
  'High Energy Physics': '#FD79A8',
  'Mathematical Physics': '#00B894',
  'Nonlinear Sciences': '#E17055',
  'Nuclear Physics': '#D63031',
  'Physics': '#0984E3',
  'Quantum Physics': '#9B59B6',
  'Quantitative Biology': '#55EFC4',
  'Quantitative Finance': '#F39C12',
  'Statistics': '#1ABC9C'
};

// All arXiv categories organized by group
export const categoryGroups = {
  'Computer Science': [
    { id: 'cs.AI', name: 'Artificial Intelligence', description: 'Covers AI areas excluding Vision, Robotics, ML, Multiagent Systems, and NLP' },
    { id: 'cs.AR', name: 'Hardware Architecture', description: 'Systems organization and hardware architecture' },
    { id: 'cs.CC', name: 'Computational Complexity', description: 'Models of computation, complexity classes, structural complexity' },
    { id: 'cs.CE', name: 'Computational Engineering, Finance, and Science', description: 'Applications to mathematical modeling in science, engineering, finance' },
    { id: 'cs.CG', name: 'Computational Geometry', description: 'Geometric algorithms and computational methods' },
    { id: 'cs.CL', name: 'Computation and Language', description: 'Natural language processing and computational linguistics' },
    { id: 'cs.CR', name: 'Cryptography and Security', description: 'Cryptography, authentication, public key systems, security' },
    { id: 'cs.CV', name: 'Computer Vision and Pattern Recognition', description: 'Image processing, vision, pattern recognition, scene understanding' },
    { id: 'cs.CY', name: 'Computers and Society', description: 'Impact on society, ethics, policy, legal aspects, education' },
    { id: 'cs.DB', name: 'Databases', description: 'Database management, datamining, data processing' },
    { id: 'cs.DC', name: 'Distributed, Parallel, and Cluster Computing', description: 'Fault-tolerance, distributed algorithms, parallel computation' },
    { id: 'cs.DL', name: 'Digital Libraries', description: 'Digital library design, document and text creation' },
    { id: 'cs.DM', name: 'Discrete Mathematics', description: 'Combinatorics, graph theory, probability applications' },
    { id: 'cs.DS', name: 'Data Structures and Algorithms', description: 'Data structures and analysis of algorithms' },
    { id: 'cs.ET', name: 'Emerging Technologies', description: 'Nanoscale, photonic, quantum, and alternative computing technologies' },
    { id: 'cs.FL', name: 'Formal Languages and Automata Theory', description: 'Automata theory, formal language theory, grammars' },
    { id: 'cs.GL', name: 'General Literature', description: 'Introductory and survey material, predictions, biographies' },
    { id: 'cs.GR', name: 'Graphics', description: 'All aspects of computer graphics' },
    { id: 'cs.GT', name: 'Computer Science and Game Theory', description: 'Mechanism design, game theory applications, agent modeling' },
    { id: 'cs.HC', name: 'Human-Computer Interaction', description: 'Human factors, user interfaces, collaborative computing' },
    { id: 'cs.IR', name: 'Information Retrieval', description: 'Indexing, retrieval, content analysis' },
    { id: 'cs.IT', name: 'Information Theory', description: 'Theoretical and experimental information theory and coding' },
    { id: 'cs.LG', name: 'Machine Learning', description: 'Machine learning research: supervised, unsupervised, reinforcement learning' },
    { id: 'cs.LO', name: 'Logic in Computer Science', description: 'Logic, finite model theory, program verification' },
    { id: 'cs.MA', name: 'Multiagent Systems', description: 'Multiagent systems, distributed AI, intelligent agents' },
    { id: 'cs.MM', name: 'Multimedia', description: 'Multimedia computing and applications' },
    { id: 'cs.MS', name: 'Mathematical Software', description: 'Mathematical software and computational tools' },
    { id: 'cs.NA', name: 'Numerical Analysis', description: 'Numerical algorithms for problems in analysis and algebra' },
    { id: 'cs.NE', name: 'Neural and Evolutionary Computing', description: 'Neural networks, genetic algorithms, adaptive behavior' },
    { id: 'cs.NI', name: 'Networking and Internet Architecture', description: 'Network architecture, protocols, standards like TCP/IP' },
    { id: 'cs.OH', name: 'Other Computer Science', description: 'Documents not fitting other classifications' },
    { id: 'cs.OS', name: 'Operating Systems', description: 'Operating system theory and design' },
    { id: 'cs.PF', name: 'Performance', description: 'Performance measurement, evaluation, queueing, simulation' },
    { id: 'cs.PL', name: 'Programming Languages', description: 'Language semantics, features, approaches, compilers' },
    { id: 'cs.RO', name: 'Robotics', description: 'Robotics theory and applications' },
    { id: 'cs.SC', name: 'Symbolic Computation', description: 'Symbolic and algebraic computation' },
    { id: 'cs.SD', name: 'Sound', description: 'Computing with sound, audio interfaces, music, signal processing' },
    { id: 'cs.SE', name: 'Software Engineering', description: 'Design tools, metrics, testing, debugging, environments' },
    { id: 'cs.SI', name: 'Social and Information Networks', description: 'Design and analysis of social and information networks' },
    { id: 'cs.SY', name: 'Systems and Control', description: 'Automatic control systems, modeling, simulation, optimization' }
  ],
  'Economics': [
    { id: 'econ.EM', name: 'Econometrics', description: 'Econometric theory, micro/macro-econometrics, statistical methods' },
    { id: 'econ.GN', name: 'General Economics', description: 'General methodological, applied, and empirical contributions' },
    { id: 'econ.TH', name: 'Theoretical Economics', description: 'Contract, decision, and game theory; equilibrium; macroeconomics' }
  ],
  'Electrical Engineering and Systems Science': [
    { id: 'eess.AS', name: 'Audio and Speech Processing', description: 'Processing signals for audio, speech, language analysis' },
    { id: 'eess.IV', name: 'Image and Video Processing', description: 'Formation, capture, and processing of images and video' },
    { id: 'eess.SP', name: 'Signal Processing', description: 'Theory and algorithms for signal and data analysis' },
    { id: 'eess.SY', name: 'Systems and Control', description: 'Control systems theory, modeling, simulation, optimization' }
  ],
  'Mathematics': [
    { id: 'math.AC', name: 'Commutative Algebra', description: 'Commutative rings, modules, ideals, homological algebra' },
    { id: 'math.AG', name: 'Algebraic Geometry', description: 'Algebraic varieties, stacks, sheaves, schemes, moduli spaces' },
    { id: 'math.AP', name: 'Analysis of PDEs', description: 'Existence, uniqueness, boundary conditions, PDE operators' },
    { id: 'math.AT', name: 'Algebraic Topology', description: 'Homotopy theory, homological algebra, algebraic manifolds' },
    { id: 'math.CA', name: 'Classical Analysis and ODEs', description: 'Special functions, orthogonal polynomials, ODEs, approximations' },
    { id: 'math.CO', name: 'Combinatorics', description: 'Discrete math, graph theory, enumeration, optimization' },
    { id: 'math.CT', name: 'Category Theory', description: 'Enriched categories, topoi, abelian categories' },
    { id: 'math.CV', name: 'Complex Variables', description: 'Holomorphic functions, automorphic forms, complex geometry' },
    { id: 'math.DG', name: 'Differential Geometry', description: 'Riemannian, contact, complex geometry, gauge theory' },
    { id: 'math.DS', name: 'Dynamical Systems', description: 'Dynamics of differential equations, mechanics, iterations' },
    { id: 'math.FA', name: 'Functional Analysis', description: 'Banach spaces, function spaces, integral transforms' },
    { id: 'math.GM', name: 'General Mathematics', description: 'General mathematical interest, uncovered topics' },
    { id: 'math.GN', name: 'General Topology', description: 'Continuum theory, point-set topology, dimension theory' },
    { id: 'math.GR', name: 'Group Theory', description: 'Finite groups, topological groups, representation theory' },
    { id: 'math.GT', name: 'Geometric Topology', description: 'Manifolds, orbifolds, polyhedra, foliations' },
    { id: 'math.HO', name: 'History and Overview', description: 'Philosophy, education, recreational mathematics' },
    { id: 'math.IT', name: 'Information Theory', description: 'Theoretical and experimental information theory and coding' },
    { id: 'math.KT', name: 'K-Theory and Homology', description: 'Algebraic and topological K-theory and relations' },
    { id: 'math.LO', name: 'Logic', description: 'Logic, set theory, formal mathematics' },
    { id: 'math.MG', name: 'Metric Geometry', description: 'Euclidean, hyperbolic, discrete, convex geometry' },
    { id: 'math.MP', name: 'Mathematical Physics', description: 'Mathematics applied to physics problems and theories' },
    { id: 'math.NA', name: 'Numerical Analysis', description: 'Numerical algorithms for analysis and algebra problems' },
    { id: 'math.NT', name: 'Number Theory', description: 'Prime numbers, diophantine equations, number theory' },
    { id: 'math.OA', name: 'Operator Algebras', description: 'Operators on Hilbert space, C*-algebras, non-commutative geometry' },
    { id: 'math.OC', name: 'Optimization and Control', description: 'Operations research, linear programming, control theory' },
    { id: 'math.PR', name: 'Probability', description: 'Probability theory and stochastic processes' },
    { id: 'math.QA', name: 'Quantum Algebra', description: 'Quantum groups, operadic algebra, quantum field theory' },
    { id: 'math.RA', name: 'Rings and Algebras', description: 'Non-commutative rings, non-associative algebras' },
    { id: 'math.RT', name: 'Representation Theory', description: 'Linear representations of algebras and groups, Lie theory' },
    { id: 'math.SG', name: 'Symplectic Geometry', description: 'Hamiltonian systems, symplectic flows, integrable systems' },
    { id: 'math.SP', name: 'Spectral Theory', description: 'Schrödinger operators, differential operators, random operators' },
    { id: 'math.ST', name: 'Statistics Theory', description: 'Applied and theoretical statistics, inference, design' }
  ],
  'Astrophysics': [
    { id: 'astro-ph.CO', name: 'Cosmology and Nongalactic Astrophysics', description: 'Early universe, CMB, cosmological parameters, dark matter' },
    { id: 'astro-ph.EP', name: 'Earth and Planetary Astrophysics', description: 'Planetary physics, extrasolar planets, solar system formation' },
    { id: 'astro-ph.GA', name: 'Astrophysics of Galaxies', description: 'Galaxy phenomena, star clusters, interstellar medium, AGN' },
    { id: 'astro-ph.HE', name: 'High Energy Astrophysical Phenomena', description: 'Cosmic rays, gamma-ray astronomy, supernovae, neutron stars' },
    { id: 'astro-ph.IM', name: 'Instrumentation and Methods for Astrophysics', description: 'Detector design, data analysis methods, statistical techniques' },
    { id: 'astro-ph.SR', name: 'Solar and Stellar Astrophysics', description: 'Stellar evolution, white dwarfs, binary systems, solar physics' }
  ],
  'Condensed Matter': [
    { id: 'cond-mat.dis-nn', name: 'Disordered Systems and Neural Networks', description: 'Glasses, random systems, transport, neural networks' },
    { id: 'cond-mat.mes-hall', name: 'Mesoscale and Nanoscale Physics', description: 'Quantum dots, wires, wells, spintronics, graphene' },
    { id: 'cond-mat.mtrl-sci', name: 'Materials Science', description: 'Techniques, synthesis, characterization, structural transitions' },
    { id: 'cond-mat.other', name: 'Other Condensed Matter', description: 'Condensed matter not fitting other classifications' },
    { id: 'cond-mat.quant-gas', name: 'Quantum Gases', description: 'Ultracold atoms, Bose-Einstein condensation, optical lattices' },
    { id: 'cond-mat.soft', name: 'Soft Condensed Matter', description: 'Membranes, polymers, liquid crystals, colloids' },
    { id: 'cond-mat.stat-mech', name: 'Statistical Mechanics', description: 'Phase transitions, thermodynamics, field theory' },
    { id: 'cond-mat.str-el', name: 'Strongly Correlated Electrons', description: 'Quantum magnetism, spin liquids, quantum criticality' },
    { id: 'cond-mat.supr-con', name: 'Superconductivity', description: 'Superconductivity theory, models, experiments' }
  ],
  'General Relativity and Quantum Cosmology': [
    { id: 'gr-qc', name: 'General Relativity and Quantum Cosmology', description: 'Gravitational physics, gravitational waves, quantum cosmology' }
  ],
  'High Energy Physics': [
    { id: 'hep-ex', name: 'High Energy Physics - Experiment', description: 'Experimental particle physics, standard model tests' },
    { id: 'hep-lat', name: 'High Energy Physics - Lattice', description: 'Lattice field theory, algorithms, phenomenology' },
    { id: 'hep-ph', name: 'High Energy Physics - Phenomenology', description: 'Theoretical particle physics, models, calculations' },
    { id: 'hep-th', name: 'High Energy Physics - Theory', description: 'Quantum field theory, string theory, supersymmetry' }
  ],
  'Mathematical Physics': [
    { id: 'math-ph', name: 'Mathematical Physics', description: 'Mathematics applied to physics, rigorous formulations' }
  ],
  'Nonlinear Sciences': [
    { id: 'nlin.AO', name: 'Adaptation and Self-Organizing Systems', description: 'Self-organizing systems, stochastic processes, machine learning' },
    { id: 'nlin.CD', name: 'Chaotic Dynamics', description: 'Dynamical systems, chaos, topology, turbulence' },
    { id: 'nlin.CG', name: 'Cellular Automata and Lattice Gases', description: 'Computational methods, time series, wavelets' },
    { id: 'nlin.PS', name: 'Pattern Formation and Solitons', description: 'Pattern formation, coherent structures, solitons' },
    { id: 'nlin.SI', name: 'Exactly Solvable and Integrable Systems', description: 'Integrable PDEs, integrable systems, solvable models' }
  ],
  'Nuclear Physics': [
    { id: 'nucl-ex', name: 'Nuclear Experiment', description: 'Experimental nuclear physics, fundamental interactions' },
    { id: 'nucl-th', name: 'Nuclear Theory', description: 'Nuclear structure, equation of states, nuclear reactions' }
  ],
  'Physics': [
    { id: 'physics.acc-ph', name: 'Accelerator Physics', description: 'Accelerator theory, technology, beam physics' },
    { id: 'physics.ao-ph', name: 'Atmospheric and Oceanic Physics', description: 'Atmospheric and oceanic physics, climate science' },
    { id: 'physics.app-ph', name: 'Applied Physics', description: 'Applications to technology, optics, nanotechnology' },
    { id: 'physics.atm-clus', name: 'Atomic and Molecular Clusters', description: 'Nanoparticles, geometric and electronic properties' },
    { id: 'physics.atom-ph', name: 'Atomic Physics', description: 'Atomic and molecular structure, spectra, collisions' },
    { id: 'physics.bio-ph', name: 'Biological Physics', description: 'Molecular biophysics, cellular biophysics, biomechanics' },
    { id: 'physics.chem-ph', name: 'Chemical Physics', description: 'Spectroscopy, electronic structure, chemical thermodynamics' },
    { id: 'physics.class-ph', name: 'Classical Physics', description: 'Newtonian dynamics, Maxwell equations, waves' },
    { id: 'physics.comp-ph', name: 'Computational Physics', description: 'All aspects of computational science applied to physics' },
    { id: 'physics.data-an', name: 'Data Analysis, Statistics and Probability', description: 'Data processing, measurement methodology, statistics' },
    { id: 'physics.ed-ph', name: 'Physics Education', description: 'Research on teaching and learning in physics' },
    { id: 'physics.flu-dyn', name: 'Fluid Dynamics', description: 'Turbulence, incompressible flows, aero/hydrodynamics' },
    { id: 'physics.gen-ph', name: 'General Physics', description: 'General physics topics' },
    { id: 'physics.geo-ph', name: 'Geophysics', description: 'Atmospheric, computational, solid earth geophysics' },
    { id: 'physics.hist-ph', name: 'History and Philosophy of Physics', description: 'History and philosophy of all physics branches' },
    { id: 'physics.ins-det', name: 'Instrumentation and Detectors', description: 'Instrumentation for natural science research' },
    { id: 'physics.med-ph', name: 'Medical Physics', description: 'Radiation therapy, biomedical imaging, dosimetry' },
    { id: 'physics.optics', name: 'Optics', description: 'Adaptive optics, lasers, holography, fiber optics' },
    { id: 'physics.plasm-ph', name: 'Plasma Physics', description: 'Fundamental plasma physics, magnetically confined plasmas' },
    { id: 'physics.pop-ph', name: 'Popular Physics', description: 'Physics for general audiences' },
    { id: 'physics.soc-ph', name: 'Physics and Society', description: 'Social network dynamics, infrastructure systems' },
    { id: 'physics.space-ph', name: 'Space Physics', description: 'Space plasma physics, heliophysics, space weather' }
  ],
  'Quantum Physics': [
    { id: 'quant-ph', name: 'Quantum Physics', description: 'Quantum mechanics, quantum computing, quantum information' }
  ],
  'Quantitative Biology': [
    { id: 'q-bio.BM', name: 'Biomolecules', description: 'DNA, RNA, proteins, molecular structures and interactions' },
    { id: 'q-bio.CB', name: 'Cell Behavior', description: 'Cell signaling, morphogenesis, apoptosis, immunology' },
    { id: 'q-bio.GN', name: 'Genomics', description: 'DNA sequencing, gene finding, genomic processes' },
    { id: 'q-bio.MN', name: 'Molecular Networks', description: 'Gene regulation, signal transduction, proteomics' },
    { id: 'q-bio.NC', name: 'Neurons and Cognition', description: 'Synapse, cortex, neural dynamics, sensorimotor control' },
    { id: 'q-bio.OT', name: 'Other Quantitative Biology', description: 'Quantitative biology not fitting other classifications' },
    { id: 'q-bio.PE', name: 'Populations and Evolution', description: 'Population dynamics, molecular evolution, phylogeny' },
    { id: 'q-bio.QM', name: 'Quantitative Methods', description: 'Experimental, numerical, statistical biology contributions' },
    { id: 'q-bio.SC', name: 'Subcellular Processes', description: 'Subcellular structures, molecular motors, organelles' },
    { id: 'q-bio.TO', name: 'Tissues and Organs', description: 'Blood flow, biomechanics, electrical waves, tumor growth' }
  ],
  'Quantitative Finance': [
    { id: 'q-fin.CP', name: 'Computational Finance', description: 'Monte Carlo, PDE, lattice methods for financial modeling' },
    { id: 'q-fin.EC', name: 'Economics', description: 'Micro/macro economics, international economics, finance' },
    { id: 'q-fin.GN', name: 'General Finance', description: 'General quantitative methodologies with finance applications' },
    { id: 'q-fin.MF', name: 'Mathematical Finance', description: 'Stochastic, probabilistic, and functional analysis methods' },
    { id: 'q-fin.PM', name: 'Portfolio Management', description: 'Security selection, capital allocation, investment strategies' },
    { id: 'q-fin.PR', name: 'Pricing of Securities', description: 'Valuation and hedging of financial securities' },
    { id: 'q-fin.RM', name: 'Risk Management', description: 'Measurement and management of financial risks' },
    { id: 'q-fin.ST', name: 'Statistical Finance', description: 'Statistical and econometric analyses of financial markets' },
    { id: 'q-fin.TR', name: 'Trading and Market Microstructure', description: 'Market microstructure, liquidity, automated trading' }
  ],
  'Statistics': [
    { id: 'stat.AP', name: 'Applications', description: 'Applications in biology, epidemiology, engineering' },
    { id: 'stat.CO', name: 'Computation', description: 'Algorithms, simulation, visualization' },
    { id: 'stat.ME', name: 'Methodology', description: 'Design, model selection, multivariate methods' },
    { id: 'stat.ML', name: 'Machine Learning', description: 'Machine learning with statistical/theoretical grounding' },
    { id: 'stat.OT', name: 'Other Statistics', description: 'Statistics not fitting other classifications' },
    { id: 'stat.TH', name: 'Statistics Theory', description: 'Asymptotics, Bayesian inference, decision theory' }
  ]
};

// Flatten all categories into a single array with group info
export const categories = Object.entries(categoryGroups).flatMap(([group, cats]) =>
  cats.map(cat => ({
    ...cat,
    group,
    color: GROUP_COLORS[group] || GROUP_COLORS[group.split(' ')[0]] || '#667eea'
  }))
);

// Get all group names
export const getGroupNames = () => Object.keys(categoryGroups);

// Get categories by group
export const getCategoriesByGroup = (groupName) => {
  const cats = categoryGroups[groupName];
  if (!cats) return [];
  const color = GROUP_COLORS[groupName] || GROUP_COLORS[groupName.split(' ')[0]] || '#667eea';
  return cats.map(cat => ({ ...cat, group: groupName, color }));
};

// Get category by ID
export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id);
};

// Get category color by ID
export const getCategoryColor = (id) => {
  const category = getCategoryById(id);
  return category ? category.color : '#667eea';
};

// Get category name by ID
export const getCategoryName = (id) => {
  const category = getCategoryById(id);
  return category ? category.name : id;
};

// Get group by category ID
export const getGroupByCategory = (id) => {
  const category = getCategoryById(id);
  return category ? category.group : null;
};

// Search categories by name or description
export const searchCategories = (query) => {
  const lowerQuery = query.toLowerCase();
  return categories.filter(cat =>
    cat.id.toLowerCase().includes(lowerQuery) ||
    cat.name.toLowerCase().includes(lowerQuery) ||
    cat.description.toLowerCase().includes(lowerQuery)
  );
};

// Popular/featured categories for homepage
export const featuredCategories = [
  'cs.AI', 'math.PR', 'q-fin.CP', 'stat.TH', 'q-bio.CB', 'cs.NE',
  'stat.ML', 'quant-ph', 'math.NT', 'physics.gen-ph',
  'astro-ph.CO', 'econ.TH', 'q-bio.NC', 'cs.RO'
].map(id => getCategoryById(id)).filter(Boolean);
