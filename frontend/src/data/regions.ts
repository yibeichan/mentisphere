import type { BrainRegion } from '@/types/brain'

export const brainRegions: BrainRegion[] = [
  {
    id: 'frontal-lobe',
    name: 'Frontal lobe',
    category: 'cortical',
    hemisphere: 'bilateral',
    summary:
      'Anterior cortical region associated with executive control, action planning, voluntary movement, and aspects of language and social behavior.',
    functions: ['Executive control', 'Motor planning', 'Working memory', 'Speech production'],
    nearbyRegionIds: ['parietal-lobe', 'temporal-lobe', 'basal-ganglia', 'corpus-callosum'],
    searchTerms: ['planning', 'decision making', 'movement', 'broca', 'working memory'],
    citations: [
      {
        id: 'purves-neuroscience',
        label: 'Purves et al., Neuroscience, 6th ed.',
        sourceType: 'anatomy-reference',
      },
      {
        id: 'miller-cohen-2001',
        label: 'Miller and Cohen, 2001, Annual Review of Neuroscience',
        sourceType: 'review',
      },
    ],
    color: '#d95f59',
    position: [0, 22, 8],
    scale: [34, 19, 20],
  },
  {
    id: 'parietal-lobe',
    name: 'Parietal lobe',
    category: 'cortical',
    hemisphere: 'bilateral',
    summary:
      'Superior-posterior cortical region associated with somatosensory processing, spatial attention, and integrating sensory information.',
    functions: ['Somatosensory processing', 'Spatial attention', 'Sensorimotor integration'],
    nearbyRegionIds: ['frontal-lobe', 'occipital-lobe', 'temporal-lobe', 'thalamus'],
    searchTerms: ['touch', 'body map', 'spatial', 'attention', 'sensory'],
    citations: [
      {
        id: 'kandel-principles',
        label: 'Kandel et al., Principles of Neural Science, 6th ed.',
        sourceType: 'anatomy-reference',
      },
      {
        id: 'corbetta-shulman-2002',
        label: 'Corbetta and Shulman, 2002, Nature Reviews Neuroscience',
        sourceType: 'review',
      },
    ],
    color: '#4f8cc9',
    position: [0, -6, 16],
    scale: [31, 18, 19],
  },
  {
    id: 'temporal-lobe',
    name: 'Temporal lobe',
    category: 'cortical',
    hemisphere: 'bilateral',
    summary:
      'Lateral-inferior cortical region associated with auditory processing, language comprehension, object recognition, and memory-related networks.',
    functions: ['Auditory processing', 'Language comprehension', 'Object recognition', 'Memory networks'],
    nearbyRegionIds: ['frontal-lobe', 'parietal-lobe', 'occipital-lobe', 'hippocampus', 'amygdala'],
    searchTerms: ['hearing', 'language', 'wernicke', 'recognition', 'memory'],
    citations: [
      {
        id: 'purves-neuroscience',
        label: 'Purves et al., Neuroscience, 6th ed.',
        sourceType: 'anatomy-reference',
      },
      {
        id: 'hickok-poeppel-2007',
        label: 'Hickok and Poeppel, 2007, Nature Reviews Neuroscience',
        sourceType: 'review',
      },
    ],
    color: '#e69f3a',
    position: [0, -4, -18],
    scale: [34, 16, 14],
  },
  {
    id: 'occipital-lobe',
    name: 'Occipital lobe',
    category: 'cortical',
    hemisphere: 'bilateral',
    summary:
      'Posterior cortical region associated primarily with visual processing, including early visual feature analysis and higher visual areas.',
    functions: ['Visual processing', 'Feature analysis', 'Visual scene interpretation'],
    nearbyRegionIds: ['parietal-lobe', 'temporal-lobe', 'cerebellum'],
    searchTerms: ['vision', 'visual cortex', 'sight', 'v1', 'visual field'],
    citations: [
      {
        id: 'kandel-principles',
        label: 'Kandel et al., Principles of Neural Science, 6th ed.',
        sourceType: 'anatomy-reference',
      },
    ],
    color: '#6aa84f',
    position: [0, -34, 5],
    scale: [25, 14, 16],
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    category: 'cerebellar',
    hemisphere: 'bilateral',
    summary:
      'Posterior-inferior structure associated with coordination, motor learning, timing, and contributions to cognitive and affective networks.',
    functions: ['Movement coordination', 'Motor learning', 'Timing', 'Cognitive modulation'],
    nearbyRegionIds: ['brainstem', 'occipital-lobe'],
    searchTerms: ['coordination', 'balance', 'motor learning', 'timing'],
    citations: [
      {
        id: 'manto-2012',
        label: 'Manto et al., 2012, The Cerebellum',
        sourceType: 'review',
      },
      {
        id: 'kandel-principles',
        label: 'Kandel et al., Principles of Neural Science, 6th ed.',
        sourceType: 'anatomy-reference',
      },
    ],
    color: '#8e7cc3',
    position: [0, -38, -22],
    scale: [25, 13, 11],
  },
  {
    id: 'brainstem',
    name: 'Brainstem',
    category: 'brainstem',
    hemisphere: 'midline',
    summary:
      'Midline structure connecting brain and spinal cord, containing pathways and nuclei important for arousal, autonomic regulation, and cranial nerve functions.',
    functions: ['Arousal systems', 'Autonomic regulation', 'Cranial nerve functions', 'Motor and sensory pathways'],
    nearbyRegionIds: ['cerebellum', 'thalamus'],
    searchTerms: ['pons', 'midbrain', 'medulla', 'autonomic', 'arousal'],
    citations: [
      {
        id: 'purves-neuroscience',
        label: 'Purves et al., Neuroscience, 6th ed.',
        sourceType: 'anatomy-reference',
      },
    ],
    color: '#9a7b4f',
    position: [0, -18, -36],
    scale: [9, 13, 20],
  },
  {
    id: 'thalamus',
    name: 'Thalamus',
    category: 'subcortical',
    hemisphere: 'bilateral',
    summary:
      'Deep gray-matter relay complex associated with sensory, motor, attention, and cortical communication networks.',
    functions: ['Sensory relay', 'Motor relay', 'Attention networks', 'Cortical communication'],
    nearbyRegionIds: ['basal-ganglia', 'hippocampus', 'brainstem', 'corpus-callosum'],
    searchTerms: ['relay', 'sensory relay', 'attention', 'deep brain'],
    citations: [
      {
        id: 'sherman-guillery-2002',
        label: 'Sherman and Guillery, 2002, Philosophical Transactions B',
        sourceType: 'review',
      },
    ],
    color: '#c27ba0',
    position: [0, -8, -4],
    scale: [12, 9, 9],
  },
  {
    id: 'basal-ganglia',
    name: 'Basal ganglia',
    category: 'subcortical',
    hemisphere: 'bilateral',
    summary:
      'Group of deep nuclei associated with action selection, reinforcement learning, habit formation, and motor control loops.',
    functions: ['Action selection', 'Motor control', 'Reinforcement learning', 'Habit learning'],
    nearbyRegionIds: ['frontal-lobe', 'thalamus', 'insula'],
    searchTerms: ['movement', 'dopamine', 'striatum', 'habit', 'reward'],
    citations: [
      {
        id: 'graybiel-2008',
        label: 'Graybiel, 2008, Annual Review of Neuroscience',
        sourceType: 'review',
      },
    ],
    color: '#674ea7',
    position: [-18, 2, -6],
    scale: [10, 8, 8],
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus',
    category: 'subcortical',
    hemisphere: 'bilateral',
    summary:
      'Medial temporal lobe structure associated with episodic memory formation, relational memory, and spatial navigation.',
    functions: ['Episodic memory', 'Relational memory', 'Spatial navigation'],
    nearbyRegionIds: ['temporal-lobe', 'amygdala', 'thalamus'],
    searchTerms: ['memory', 'episodic', 'navigation', 'medial temporal'],
    citations: [
      {
        id: 'scoville-milner-1957',
        label: 'Scoville and Milner, 1957, Journal of Neurology, Neurosurgery, and Psychiatry',
        sourceType: 'anatomy-reference',
      },
      {
        id: 'squire-1992',
        label: 'Squire, 1992, Psychological Review',
        sourceType: 'review',
      },
    ],
    color: '#cc4125',
    position: [14, -10, -18],
    scale: [10, 5, 5],
  },
  {
    id: 'amygdala',
    name: 'Amygdala',
    category: 'subcortical',
    hemisphere: 'bilateral',
    summary:
      'Medial temporal lobe nuclear complex associated with salience, threat learning, emotional memory, and valuation networks.',
    functions: ['Threat learning', 'Emotional memory', 'Salience processing', 'Valuation'],
    nearbyRegionIds: ['temporal-lobe', 'hippocampus', 'insula'],
    searchTerms: ['emotion', 'fear', 'salience', 'threat', 'valuation'],
    citations: [
      {
        id: 'ledoux-2000',
        label: 'LeDoux, 2000, Annual Review of Neuroscience',
        sourceType: 'review',
      },
      {
        id: 'phelps-ledoux-2005',
        label: 'Phelps and LeDoux, 2005, Neuron',
        sourceType: 'review',
      },
    ],
    color: '#a61c00',
    position: [20, -3, -18],
    scale: [6, 5, 5],
  },
  {
    id: 'insula',
    name: 'Insula',
    category: 'cortical',
    hemisphere: 'bilateral',
    summary:
      'Folded cortical region buried inside the lateral sulcus, associated with interoception, salience, taste, pain, and affective awareness.',
    functions: ['Interoception', 'Salience processing', 'Taste', 'Pain and affective awareness'],
    nearbyRegionIds: ['frontal-lobe', 'temporal-lobe', 'basal-ganglia', 'amygdala'],
    searchTerms: ['interoception', 'salience', 'taste', 'pain', 'awareness'],
    citations: [
      {
        id: 'craig-2009',
        label: 'Craig, 2009, Nature Reviews Neuroscience',
        sourceType: 'review',
      },
    ],
    color: '#00a2a5',
    position: [-25, 0, -7],
    scale: [7, 12, 9],
  },
  {
    id: 'corpus-callosum',
    name: 'Corpus callosum',
    category: 'white-matter',
    hemisphere: 'midline',
    summary:
      'Major commissural white-matter tract connecting the left and right cerebral hemispheres.',
    functions: ['Interhemispheric communication', 'Information transfer between cortical networks'],
    nearbyRegionIds: ['frontal-lobe', 'parietal-lobe', 'thalamus'],
    searchTerms: ['white matter', 'hemispheres', 'commissure', 'connection'],
    citations: [
      {
        id: 'kandel-principles',
        label: 'Kandel et al., Principles of Neural Science, 6th ed.',
        sourceType: 'anatomy-reference',
      },
    ],
    color: '#f1c232',
    position: [0, 5, 5],
    scale: [23, 3, 4],
  },
]

export const regionById = new Map(brainRegions.map((region) => [region.id, region]))
