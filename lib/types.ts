// Domain types mirroring supabase/schema.sql.
// Keep in sync with the SQL — the database is the source of truth.

export type UserRole =
  | 'student' | 'parent' | 'teacher' | 'principal' | 'school_admin' | 'finance'
  | 'librarian' | 'transport' | 'security' | 'counselor' | 'registrar' | 'super_admin';

export type SchoolType =
  | 'nursery' | 'primary' | 'secondary' | 'college' | 'university' | 'nursing_school'
  | 'law_school' | 'technical_college' | 'vocational' | 'corporate_academy';

export type VerificationStatus = 'unverified' | 'school_verified' | 'document_verified';
export type ProfileStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'alumni';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';
export type AdmissionStatus = 'pending' | 'review' | 'interview' | 'admitted' | 'rejected' | 'withdrawn';
export type LoanStatus = 'out' | 'returned' | 'overdue' | 'lost';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PlanTier = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled';

export interface School {
  id: string;
  slug: string;
  name: string;
  motto: string | null;
  school_type: SchoolType;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  country: string;
  city: string | null;
  currency: string;
  enabled_modules: string[];
  plan: PlanTier;
  billing_status: SubscriptionStatus;
  created_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  photo_url: string | null;
  citizen_id_consent: boolean;
  citizen_id_ref: string | null;
}

export interface Profile {
  id: string;
  person_id: string;
  school_id: string | null;
  user_id: string | null;
  role: UserRole;
  email: string | null;
  phone: string | null;
  schoolid_number: string | null;
  qr_token: string | null;
  verification_status: VerificationStatus;
  idvero_ref: string | null;
  afriid_ref: string | null;
  welcome_email_sent: boolean;
  status: ProfileStatus;
  title: string | null;
  joined_on: string | null;
  people?: Person;       // joined
  schools?: School;      // joined
}

export interface AttendanceRow {
  id: string;
  student_profile_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
}

export interface Assignment {
  id: string;
  class_id: string;
  subject_id: string;
  kind: 'homework' | 'assignment' | 'project' | 'quiz';
  title: string;
  instructions: string | null;
  max_score: number;
  due_at: string;
  subjects?: { name: string };
  classes?: { name: string };
}

export interface ExamResult {
  id: string;
  student_profile_id: string;
  subject_id: string;
  score: number;
  max_score: number;
  grade_letter: string | null;
  remark: string | null;
  subjects?: { name: string };
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  subject_id: string;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  room: string | null;
  subjects?: { name: string };
  classes?: { name: string };
}

export interface Invoice {
  id: string;
  student_profile_id: string;
  number: string;
  status: InvoiceStatus;
  issued_on: string;
  due_on: string;
  total: number;
  currency: string;
  profiles?: { schoolid_number: string | null; people?: { full_name: string } };
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  shelf: string | null;
  copies_total: number;
  copies_available: number;
}

export interface BookLoan {
  id: string;
  book_id: string;
  borrower_profile_id: string;
  borrowed_at: string;
  due_on: string;
  returned_at: string | null;
  fine_amount: number;
  status: LoanStatus;
  books?: { title: string };
  profiles?: { people?: { full_name: string } };
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience_roles: UserRole[];
  is_emergency: boolean;
  published_at: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  kind: 'event' | 'holiday' | 'exam' | 'meeting' | 'trip';
  location: string | null;
  starts_at: string;
  ends_at: string | null;
}

export interface VerifiedIdentity {
  full_name: string;
  role: UserRole;
  school_name: string;
  school_logo: string | null;
  school_primary_color: string;
  photo_url: string | null;
  verification_status: VerificationStatus;
  schoolid_number: string;
  status: ProfileStatus;
}
