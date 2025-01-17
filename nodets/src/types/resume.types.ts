interface Contact {
  phone: string;
  email: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

interface Experience {
  role: string;
  company: string;
  location?: string;
  companyDescription: string;
  period: string;
  techStack: string[];
  achievements: string[];
}

interface Education {
  degree: string;
  school: string;
  location: string;
  period: string;
  schoolDescription: string;
  achievements?: string[];
}

type SkillCategories =
  | "Programming Languages"
  | "Frontend"
  | "Backend"
  | "Databases"
  | "Cloud & DevOps"
  | "Others";

type Skills = {
  [K in SkillCategories]: string[];
};

export interface Resume {
  name: string;
  title: string;
  contact: Contact;
  summary: string;
  skills: Skills;
  experiences: Experience[];
  education: Education[];
}

export type { Experience, Education, Skills, SkillCategories, Contact };
