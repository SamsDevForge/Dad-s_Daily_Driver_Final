export const initialMedicines = [
  {
    id: '1',
    name: 'Metformin 500mg',
    alias: 'Sugar tablet',
    description: 'Take after lunch',
    time: '14:00',
    type: 'Diabetes',
    status: 'Pending',
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Telmisartan 40mg',
    alias: 'BP tablet',
    description: 'Take after breakfast',
    time: '09:00',
    type: 'BP',
    status: 'Taken',
    imageUrl: null,
  },
  {
    id: '3',
    name: 'Aspirin 75mg',
    alias: 'Heart tablet',
    description: 'Take with dinner',
    time: '20:00',
    type: 'Heart',
    status: 'Pending',
    imageUrl: null,
  }
];

export const initialDocuments = [
  {
    id: '1',
    name: 'Aadhaar Card',
    category: 'Identity',
    tags: ['ID', 'Government'],
    uploadDate: '2023-01-15',
    type: 'Image',
    description: 'Dad\'s main ID proof',
    url: '#'
  },
  {
    id: '2',
    name: 'Health Insurance Policy',
    category: 'Insurance',
    tags: ['Medical', 'Star Health'],
    uploadDate: '2023-05-10',
    type: 'PDF',
    description: 'Current year health insurance',
    url: '#'
  },
  {
    id: '3',
    name: 'Latest Blood Report',
    category: 'Medical',
    tags: ['Report', 'Sugar'],
    uploadDate: '2023-10-05',
    type: 'PDF',
    description: 'Routine checkup report',
    url: '#'
  }
];

export const weatherData = {
  city: 'Pune',
  temp: 28,
  high: 32,
  low: 21,
  condition: 'Partly Cloudy',
  rainChance: 20,
  advice: 'Good day for outdoor work. Keep a water bottle handy.',
  icon: 'CloudSun' // mapping to lucide-react icon
};

export const newsData = [
  {
    id: '1',
    category: 'India',
    headline: 'New Highway inaugurated connecting Pune to Nashik',
    summary: 'The new multi-lane highway reduces travel time by 2 hours. Expected to boost local trade and make family trips easier.',
    fullText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Today'
  },
  {
    id: '2',
    category: 'Business',
    headline: 'Fixed Deposit rates increased by major banks',
    summary: 'Senior citizens can now avail up to 8.5% interest on 3-year FDs. Good time to review investments.',
    fullText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Today'
  },
  {
    id: '3',
    category: 'Health',
    headline: 'Walking 7000 steps daily reduces heart risks by 40%',
    summary: 'New study suggests moderate daily walking is highly effective for heart health in older adults.',
    fullText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Yesterday'
  },
  {
    id: '4',
    category: 'Local',
    headline: 'Pune Metro extends operations to Swargate',
    summary: 'The new underground stretch is now open to public, providing seamless connectivity to the central areas.',
    fullText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Yesterday'
  }
];

export const alertsData = [
  {
    id: '1',
    title: 'Medicine Due',
    message: 'Time for BP tablet (Telmisartan)',
    type: 'warning',
    icon: 'Pill'
  },
  {
    id: '2',
    title: 'Weather Alert',
    message: 'Light rain expected around 5 PM',
    type: 'info',
    icon: 'CloudRain'
  },
  {
    id: '3',
    title: 'Reminder',
    message: 'Call insurance agent tomorrow',
    type: 'alert',
    icon: 'Bell'
  }
];

export const initialEvents = [
  {
    id: '1',
    title: 'Call Rahul (Son)',
    date: '2023-11-25',
    time: '18:00',
    tag: 'Family',
    notes: 'Ask about the new project',
    reminder: true
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    date: '2023-11-26',
    time: '10:30',
    tag: 'Health',
    notes: 'Bring latest blood report',
    reminder: true
  },
  {
    id: '3',
    title: 'Pay Electricity Bill',
    date: '2023-11-28',
    time: '09:00',
    tag: 'Bills',
    notes: 'Check meter reading',
    reminder: false
  }
];
