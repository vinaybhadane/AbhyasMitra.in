import { Timestamp } from 'firebase/firestore';
import React from 'react';
import {
  Calculator,
  FlaskConical,
  Telescope,
  Settings,
  Ruler,
  TerminalSquare,
  Database,
  Binary,
  Cpu,
  Radio,
  Leaf,
  BarChart,
  LineChart,
} from 'lucide-react';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  category: string;
  subject: string;
  unit?: string;          // e.g. "Unit 1: Introduction"
  year: '1st' | '2nd';
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  author: string;
  authorEmail: string;
  publishDate: Timestamp | Date;
  readingTime: number;
  wordCount: number;      // for content quality tracking
  views: number;
  status: 'draft' | 'published';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/** A unit/chapter grouping within a subject, stored in Firestore 'units' collection */
export interface SubjectUnit {
  id: string;
  subjectSlug: string;    // e.g. "engineering-mathematics-2"
  name: string;           // e.g. "Unit 1: Differential Equations"
  order: number;          // for sorting
  createdAt: Timestamp | Date;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  authorName: string;
  authorEmail: string;
  authorPhotoURL: string;
  userId: string;
  createdAt: Timestamp | Date;
  replies?: Comment[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Timestamp | Date;
  read: boolean;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  year: '1st' | '2nd';
  semester: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}

export const SUBJECTS: Subject[] = [
  // First Year
  {
    id: 'engineering-mathematics-2',
    name: 'Engineering Mathematics 2',
    slug: 'engineering-mathematics-2',
    year: '1st',
    semester: 'FE Sem 2',
    description: 'M2 notes, solutions and study material for SPPU 2024 pattern.',
    icon: <Calculator className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    iconColor: '#2563eb',
  },
  {
    id: 'engineering-chemistry',
    name: 'Engineering Chemistry',
    slug: 'engineering-chemistry',
    year: '1st',
    semester: 'FE Sem 1',
    description: 'Chemistry notes, practicals and solutions for first year engineering.',
    icon: <FlaskConical className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-600',
    iconColor: '#059669',
  },
  {
    id: 'engineering-physics',
    name: 'Engineering Physics',
    slug: 'engineering-physics',
    year: '1st',
    semester: 'FE Sem 1',
    description: 'Physics concepts, derivations and solved problems for SPPU.',
    icon: <Telescope className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-600',
    iconColor: '#7c3aed',
  },
  {
    id: 'engineering-mechanics',
    name: 'Engineering Mechanics',
    slug: 'engineering-mechanics',
    year: '1st',
    semester: 'FE Sem 1',
    description: 'Mechanics theory, diagrams, and numerical solutions.',
    icon: <Settings className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    iconColor: '#ea580c',
  },
  {
    id: 'engineering-graphics',
    name: 'Engineering Graphics',
    slug: 'engineering-graphics',
    year: '1st',
    semester: 'FE Sem 2',
    description: 'Drawing tutorials, AutoCAD basics and projection problems.',
    icon: <Ruler className="w-5 h-5" />,
    color: 'from-teal-500 to-cyan-600',
    iconColor: '#0d9488',
  },
  {
    id: 'programming-and-problem-solving',
    name: 'Programming and Problem Solving',
    slug: 'programming-and-problem-solving',
    year: '1st',
    semester: 'FE Sem 2',
    description: 'C programming, algorithms and problem solving techniques.',
    icon: <TerminalSquare className="w-5 h-5" />,
    color: 'from-yellow-500 to-amber-600',
    iconColor: '#d97706',
  },
  // Second Year Computer
  {
    id: 'database-management-system',
    name: 'Database Management System',
    slug: 'database-management-system',
    year: '2nd',
    semester: 'SE Comp Sem 3',
    description: 'DBMS concepts, SQL queries, normalization and transactions.',
    icon: <Database className="w-5 h-5" />,
    color: 'from-blue-600 to-cyan-600',
    iconColor: '#2563eb',
  },
  {
    id: 'discrete-mathematics',
    name: 'Discrete Mathematics',
    slug: 'discrete-mathematics',
    year: '2nd',
    semester: 'SE Comp Sem 3',
    description: 'Graph theory, logic, sets and combinatorics for computer engineering.',
    icon: <Binary className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-600',
    iconColor: '#6366f1',
  },
  {
    id: 'computer-organization-and-microprocessor',
    name: 'Computer Organization and Microprocessor',
    slug: 'computer-organization-and-microprocessor',
    year: '2nd',
    semester: 'SE Comp Sem 3',
    description: '8085/8086 microprocessor, memory organization and interfacing.',
    icon: <Cpu className="w-5 h-5" />,
    color: 'from-gray-600 to-slate-700',
    iconColor: '#475569',
  },
  {
    id: 'internet-of-things',
    name: 'Internet of Things',
    slug: 'internet-of-things',
    year: '2nd',
    semester: 'SE Comp Sem 3',
    description: 'IoT architecture, protocols, Arduino and Raspberry Pi projects.',
    icon: <Radio className="w-5 h-5" />,
    color: 'from-green-500 to-teal-600',
    iconColor: '#0d9488',
  },
  {
    id: 'environmental-studies',
    name: 'Environmental Studies',
    slug: 'environmental-studies',
    year: '2nd',
    semester: 'SE Comp Sem 4',
    description: 'Ecosystem, pollution, sustainability and environmental laws.',
    icon: <Leaf className="w-5 h-5" />,
    color: 'from-emerald-500 to-green-600',
    iconColor: '#059669',
  },
  {
    id: 'project-management',
    name: 'Project Management',
    slug: 'project-management',
    year: '2nd',
    semester: 'SE Comp Sem 4',
    description: 'Elective: Project planning, scheduling, risk management and agile.',
    icon: <BarChart className="w-5 h-5" />,
    color: 'from-orange-400 to-pink-500',
    iconColor: '#ea580c',
  },
  {
    id: 'business-analytics',
    name: 'Business Analytics',
    slug: 'business-analytics',
    year: '2nd',
    semester: 'SE Comp Sem 4',
    description: 'Elective: Data analysis, BI tools, statistics for business decisions.',
    icon: <LineChart className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-600',
    iconColor: '#e11d48',
  },
];

export const getSubjectBySlug = (slug: string): Subject | undefined =>
  SUBJECTS.find((s) => s.slug === slug);

export const getSubjectsByYear = (year: '1st' | '2nd'): Subject[] =>
  SUBJECTS.filter((s) => s.year === year);
