import type { PortfolioData, ModuleData } from '@/types';

export const portfolioData: PortfolioData = {
  name: 'Ahmed Gamal Farouk',
  title: 'Front-End & Cross-Platform Mobile Developer',
  skills: [
    'Dart', 'Java', 'JavaScript', 'TypeScript',
    'HTML', 'CSS', 'SQL', 'Flutter',
    'React', 'React Native', 'Angular',
  ],
  softSkills: [
    'Communication',
    'Team Collaboration',
    'Agile Methodology',
    'Problem-Solving',
    'Critical Thinking',
  ],
  projects: [
    {
      title: 'Eshtry Menny',
      description: 'E-commerce mobile app with real-time cart and payment integration.',
      tech: ['Flutter', 'Dart', 'Firebase'],
    },
    {
      title: 'Cinema Flux',
      description: 'Movie browsing app with advanced search and favorites system.',
      tech: ['React Native', 'TypeScript', 'TMDB API'],
    },
    {
      title: 'Circle-Mobile',
      description: 'Cross-platform social network with post feed and notifications.',
      tech: ['Flutter', 'Dart', 'REST API'],
    },
    {
      title: 'Social Media App',
      description: 'Full-featured social platform with authentication and media upload.',
      tech: ['React', 'TypeScript', 'Node.js'],
    },
  ],
  certifications: [
    {
      name: 'Front End Development Track',
      issuer: 'Information Technology Institute (ITI)',
      year: '2024',
    },
    {
      name: 'Flutter Development',
      issuer: 'Orange Digital Center',
      year: '2023',
    },
    {
      name: 'Network Security Fundamentals',
      issuer: 'Microsoft',
      year: '2023',
    },
    {
      name: 'UX Design',
      issuer: 'Udacity',
      year: '2022',
    },
  ],
  contact: {
    email: 'ahmed.gamal.farouk@email.com',
    phone: '+20 XXX XXX XXXX',
    linkedin: 'linkedin.com/in/ahmed-gamal-farouk',
    github: 'github.com/AhmedGamalFarouk',
    location: 'Egypt',
  },
};

export const moduleDefinitions: ModuleData[] = [
  {
    id: 'tech',
    name: 'Technical Skills',
    color: '#00f3ff',
    position: [-6, 0.1, -5],
    type: 'tech',
  },
  {
    id: 'human',
    name: 'Human Factor',
    color: '#9b59b6',
    position: [-7, 0.1, 4],
    type: 'human',
  },
  {
    id: 'certs',
    name: 'Certifications',
    color: '#f39c12',
    position: [7, 0.1, 4],
    type: 'certs',
  },
  {
    id: 'projects',
    name: 'Projects',
    color: '#2ecc71',
    position: [6, 0.1, -5],
    type: 'projects',
  },
  {
    id: 'contact',
    name: 'Network Uplink',
    color: '#e74c3c',
    position: [0, 0.1, 7.5],
    type: 'contact',
  },
];
