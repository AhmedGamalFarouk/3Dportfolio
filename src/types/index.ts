// ─── App State ───────────────────────────────────────────────────────────────

export type AppState =
  | 'WELCOME'
  | 'INTRO'
  | 'CORE_INACTIVE'
  | 'CORE_ACTIVE'
  | 'MODULE_FOCUSED';

// ─── Module Data ─────────────────────────────────────────────────────────────

export interface ModuleData {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  type: 'tech' | 'human' | 'certs' | 'projects' | 'contact';
}

// ─── Portfolio Content Types ─────────────────────────────────────────────────

export interface Project {
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  skills: string[];
  softSkills: string[];
  projects: Project[];
  certifications: Certification[];
  contact: ContactInfo;
}
