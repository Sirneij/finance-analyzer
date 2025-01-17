import {
  Contact,
  Education,
  Experience,
  Resume,
  Skills,
} from "$types/resume.types.js";

function isResume(data: unknown): data is Resume {
  if (!data || typeof data !== "object") return false;

  const resume = data as Resume;

  return (
    typeof resume.name === "string" &&
    typeof resume.title === "string" &&
    typeof resume.summary === "string" &&
    isContact(resume.contact) &&
    isSkills(resume.skills) &&
    Array.isArray(resume.experiences) &&
    resume.experiences.every(isExperience) &&
    Array.isArray(resume.education) &&
    resume.education.every(isEducation)
  );
}

function isContact(data: unknown): data is Contact {
  if (!data || typeof data !== "object") return false;
  const contact = data as Contact;
  return (
    typeof contact.email === "string" &&
    typeof contact.phone === "string" &&
    typeof contact.location === "string"
  );
}

function isSkills(data: unknown): data is Skills {
  if (!data || typeof data !== "object") return false;
  const skills = data as Skills;
  return (
    Array.isArray(skills.Backend) &&
    skills.Backend.every((skill) => typeof skill === "string") &&
    Array.isArray(skills.Frontend) &&
    skills.Frontend.every((skill) => typeof skill === "string") &&
    Array.isArray(skills.Databases)
  );
}

function isExperience(data: unknown): data is Experience {
  if (!data || typeof data !== "object") return false;
  const exp = data as Experience;
  return (
    typeof exp.company === "string" &&
    typeof exp.companyDescription === "string" &&
    typeof exp.period === "string" &&
    typeof exp.role === "string" &&
    Array.isArray(exp.achievements) &&
    exp.achievements.every((r) => typeof r === "string") &&
    Array.isArray(exp.techStack) &&
    exp.techStack.every((r) => typeof r === "string")
  );
}

function isEducation(data: unknown): data is Education {
  if (!data || typeof data !== "object") return false;
  const edu = data as Education;
  return (
    typeof edu.school === "string" &&
    typeof edu.degree === "string" &&
    typeof edu.schoolDescription === "string" &&
    typeof edu.period === "string" &&
    typeof edu.location === "string" &&
    (!edu.achievements ||
      (Array.isArray(edu.achievements) &&
        edu.achievements.every((r) => typeof r === "string")))
  );
}

export { isResume, isContact, isSkills, isExperience, isEducation };
