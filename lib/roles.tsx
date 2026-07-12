// The role registry: single source of truth for how each of the 12 roles
// appears and navigates. Adding a role = one enum value in SQL, one entry
// here, one dashboard component.
import type { UserRole } from './types';
import {
  GraduationCap, Users, BookOpen, Landmark, Settings2, Wallet,
  Library, Bus, ShieldCheck, HeartHandshake, ScrollText, Globe2,
  type LucideIcon,
} from 'lucide-react';

export interface RoleMeta {
  role: UserRole;
  label: string;
  icon: LucideIcon;
  description: string;
  /** AI modes this role may use (keys into lib/ai.ts MODES) */
  aiModes: string[];
}

export const ROLES: Record<UserRole, RoleMeta> = {
  student: {
    role: 'student', label: 'Student', icon: GraduationCap,
    description: 'Timetable, homework, results, digital ID, AI tutor.',
    aiModes: ['tutor', 'homework_helper'],
  },
  parent: {
    role: 'parent', label: 'Parent', icon: Users,
    description: 'Every child, every result, every fee — in one place.',
    aiModes: ['parent_guide'],
  },
  teacher: {
    role: 'teacher', label: 'Teacher', icon: BookOpen,
    description: 'Attendance, gradebook, assignments, AI lesson planning.',
    aiModes: ['lesson_planner', 'exam_generator', 'report_writer'],
  },
  principal: {
    role: 'principal', label: 'Principal', icon: Landmark,
    description: 'Whole-school performance, revenue and risk at a glance.',
    aiModes: ['school_analyst', 'risk_insights'],
  },
  school_admin: {
    role: 'school_admin', label: 'Administrator', icon: Settings2,
    description: 'Students, staff, classes, academic years, permissions.',
    aiModes: ['school_analyst', 'timetable_assistant'],
  },
  finance: {
    role: 'finance', label: 'Finance Officer', icon: Wallet,
    description: 'Invoices, payments, scholarships, outstanding balances.',
    aiModes: ['school_analyst'],
  },
  librarian: {
    role: 'librarian', label: 'Librarian', icon: Library,
    description: 'Catalogue, lending, returns, fines, inventory.',
    aiModes: [],
  },
  transport: {
    role: 'transport', label: 'Transport', icon: Bus,
    description: 'Routes, stops, pickup manifests, drivers.',
    aiModes: [],
  },
  security: {
    role: 'security', label: 'Security Officer', icon: ShieldCheck,
    description: 'Visitors, QR gate verification, entry/exit logs, alerts.',
    aiModes: [],
  },
  counselor: {
    role: 'counselor', label: 'Counselor', icon: HeartHandshake,
    description: 'Student wellbeing caseload with restricted access.',
    aiModes: ['risk_insights'],
  },
  registrar: {
    role: 'registrar', label: 'Registrar', icon: ScrollText,
    description: 'Admissions pipeline, transcripts, certificates, alumni.',
    aiModes: ['report_writer'],
  },
  super_admin: {
    role: 'super_admin', label: 'Super Admin', icon: Globe2,
    description: 'Every school, subscription, and audit trail on the platform.',
    aiModes: ['school_analyst'],
  },
};

export const ROLE_LIST = Object.values(ROLES);

export function roleMeta(role: UserRole): RoleMeta {
  return ROLES[role] ?? ROLES.student;
}
