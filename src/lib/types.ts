// src/lib/types.ts

export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Member {
  id: string;
  name: string;
  title: string;
  project: string;
  phone: string;
  email: string;
  department: string;
  level: Level;
  parentId: string | null;
  photo?: string;
  bio?: string;
  linkedin?: string;
  joinDate?: string;
}

export const LEVELS = [
  { label: 'Founder',      color: '#FFD700', ring: 'rgba(255,215,0,0.35)',    bg: 'rgba(255,215,0,0.08)'   },
  { label: 'C-Suite',      color: '#E879F9', ring: 'rgba(232,121,249,0.35)',  bg: 'rgba(232,121,249,0.08)' },
  { label: 'Director',     color: '#60A5FA', ring: 'rgba(96,165,250,0.35)',   bg: 'rgba(96,165,250,0.08)'  },
  { label: 'Manager',      color: '#34D399', ring: 'rgba(52,211,153,0.35)',   bg: 'rgba(52,211,153,0.08)'  },
  { label: 'Lead',         color: '#FB923C', ring: 'rgba(251,146,60,0.35)',   bg: 'rgba(251,146,60,0.08)'  },
  { label: 'Engineer',     color: '#A78BFA', ring: 'rgba(167,139,250,0.35)',  bg: 'rgba(167,139,250,0.08)' },
  { label: 'Jr. Engineer', color: '#94A3B8', ring: 'rgba(148,163,184,0.35)', bg: 'rgba(148,163,184,0.08)' },
  { label: 'Intern',       color: '#6EE7B7', ring: 'rgba(110,231,183,0.35)', bg: 'rgba(110,231,183,0.08)' },
] as const;

export const DEPARTMENTS = [
  'Leadership', 'Technology', 'Product', 'Operations',
  'Design', 'Marketing', 'Finance', 'HR', 'Sales',
];

export const SEED_MEMBERS: Member[] = [
  {
    id: '1', name: 'Kiran Chakravarthy', title: 'Co-Founder & CEO',
    project: 'ImLocl Platform', phone: '+91 98765 00001', email: 'kiran@imlocl.com',
    department: 'Leadership', level: 0, parentId: null,
    bio: 'Visionary leader building the future of hyperlocal delivery in India.',
    joinDate: '2023-01-01', linkedin: 'linkedin.com/in/kiran',
  },
  {
    id: '2', name: 'Arjun Mehta', title: 'Co-Founder & CTO',
    project: 'Platform Architecture', phone: '+91 98765 00002', email: 'arjun@imlocl.com',
    department: 'Technology', level: 0, parentId: null,
    bio: 'Full-stack architect with 12 years building scalable platforms.',
    joinDate: '2023-01-01', linkedin: 'linkedin.com/in/arjun',
  },
  {
    id: '3', name: 'Priya Sharma', title: 'Chief Operating Officer',
    project: 'Operations Scale', phone: '+91 98765 00003', email: 'priya@imlocl.com',
    department: 'Operations', level: 1, parentId: '1', joinDate: '2023-03-01',
  },
  {
    id: '4', name: 'Rahul Nair', title: 'Director of Engineering',
    project: 'Backend Systems', phone: '+91 98765 00004', email: 'rahul@imlocl.com',
    department: 'Technology', level: 2, parentId: '2', joinDate: '2023-04-01',
  },
  {
    id: '5', name: 'Sneha Reddy', title: 'Director of Product',
    project: 'Customer App v2', phone: '+91 98765 00005', email: 'sneha@imlocl.com',
    department: 'Product', level: 2, parentId: '2', joinDate: '2023-05-01',
  },
  {
    id: '6', name: 'Vikram Singh', title: 'Operations Manager',
    project: 'City Expansion', phone: '+91 98765 00006', email: 'vikram@imlocl.com',
    department: 'Operations', level: 3, parentId: '3', joinDate: '2023-06-01',
  },
  {
    id: '7', name: 'Anita Rao', title: 'Engineering Manager',
    project: 'Partner App', phone: '+91 98765 00007', email: 'anita@imlocl.com',
    department: 'Technology', level: 3, parentId: '4', joinDate: '2023-07-01',
  },
  {
    id: '8', name: 'Dev Kapoor', title: 'Frontend Lead',
    project: 'Admin Dashboard', phone: '+91 98765 00008', email: 'dev@imlocl.com',
    department: 'Technology', level: 4, parentId: '7', joinDate: '2023-08-01',
  },
  {
    id: '9', name: 'Meera Iyer', title: 'Backend Lead',
    project: 'API Gateway', phone: '+91 98765 00009', email: 'meera@imlocl.com',
    department: 'Technology', level: 4, parentId: '7', joinDate: '2023-09-01',
  },
  {
    id: '10', name: 'Aryan Gupta', title: 'Senior Engineer',
    project: 'Admin Dashboard', phone: '+91 98765 00010', email: 'aryan@imlocl.com',
    department: 'Technology', level: 5, parentId: '8', joinDate: '2024-01-01',
  },
  {
    id: '11', name: 'Kavya Pillai', title: 'Senior Engineer',
    project: 'API Gateway', phone: '+91 98765 00011', email: 'kavya@imlocl.com',
    department: 'Technology', level: 5, parentId: '9', joinDate: '2024-01-01',
  },
  {
    id: '12', name: 'Rohan Das', title: 'Junior Engineer',
    project: 'Admin Dashboard', phone: '+91 98765 00012', email: 'rohan@imlocl.com',
    department: 'Technology', level: 6, parentId: '10', joinDate: '2024-06-01',
  },
  {
    id: '13', name: 'Sana Qureshi', title: 'Intern – Frontend',
    project: 'Customer App v2', phone: '+91 98765 00013', email: 'sana@imlocl.com',
    department: 'Technology', level: 7, parentId: '8', joinDate: '2025-01-01',
  },
];
