import {
  Activity, Building2, CalendarCheck, Fingerprint, HeartHandshake, Route, ShieldCheck, Stethoscope, User,
  type LucideIcon,
} from 'lucide-react';
import type { PortalType } from '../auth/session';

export type PortalInfo = {
  role: PortalType;
  icon: LucideIcon;
  title: string;
  text: string;
  /** What this role does inside the platform: taken from the product README. */
  points: string[];
};

/** The five portals. Copy matches the product README; nothing here is invented. */
export const PORTALS: PortalInfo[] = [
  {
    role: 'patient', icon: User, title: 'Patient',
    text: 'Own your lifelong health identity, records, medicines and care journey.',
    points: ['Dashboard, health overview and patient timeline', 'Appointments, cases, medicines and results', 'Health QR, billing, notifications and emergency workflows'],
  },
  {
    role: 'caretaker', icon: HeartHandshake, title: 'Caretaker',
    text: 'Coordinate medicines, care tasks and patient updates with confidence.',
    points: ['Care overview with an assigned-patient selector', 'Medicine monitoring and medication checklist', 'Appointments, care activities and assignment responses'],
  },
  {
    role: 'doctor', icon: Stethoscope, title: 'Doctor',
    text: 'Review verified records, vitals, prescriptions and patient history faster.',
    points: ['Clinical dashboard, cases, vitals and diagnoses', 'Patient verification, prescriptions and medicines', 'Appointments, hospital affiliations, earnings and messages'],
  },
  {
    role: 'hospital', icon: Building2, title: 'Hospital',
    text: 'Manage hospital operations, doctors, patients, records and appointments.',
    points: ['Patients, doctors and affiliation requests', 'Appointments, cases, medicines and billing', 'Result upload, reports and hospital requests'],
  },
  {
    role: 'admin', icon: ShieldCheck, title: 'Government Admin',
    text: 'National oversight of hospitals, doctors, patients and appointments.',
    points: ['National overview of the connected network', 'Hospitals, doctors, patients and cases', 'Reports, system activity and protected oversight'],
  },
];

/** Entries for the Solutions menu; ids match landing sections. */
export const SOLUTIONS: { id: string; icon: LucideIcon; title: string; text: string }[] = [
  { id: 'identity', icon: Fingerprint, title: 'Health Identity', text: 'One Health ID and QR that follow the patient.' },
  { id: 'capabilities', icon: Activity, title: 'Connected Medical Records', text: 'Cases, medicines, results and billing in one record.' },
  { id: 'consultations', icon: CalendarCheck, title: 'Appointments', text: 'Booking, queue numbers and clinical follow-through.' },
  { id: 'journey', icon: Route, title: 'Healthcare Coordination', text: 'From registration to continued authorized care.' },
];

export type InfoKey = 'security' | 'about' | 'privacy' | 'terms';
