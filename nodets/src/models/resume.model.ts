import mongoose, { Schema, Document } from "mongoose";
import { Resume, SkillCategories } from "$types/resume.types.js";

// Document interface
interface IResume extends Resume, Document {}

// Skill Categories enum values
const skillCategories: SkillCategories[] = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Cloud & DevOps",
  "Others",
];

// Contact Schema
const ContactSchema = new Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  website: String,
  linkedin: String,
  github: String,
});

// Experience Schema
const ExperienceSchema = new Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  companyDescription: { type: String, required: true },
  period: { type: String, required: true },
  techStack: [{ type: String, required: true }],
  achievements: [{ type: String, required: true }],
});

// Education Schema
const EducationSchema = new Schema({
  degree: { type: String, required: true },
  school: { type: String, required: true },
  location: { type: String, required: true },
  period: { type: String, required: true },
  schoolDescription: { type: String, required: true },
  achievements: [String],
});

// Skills Schema (using enum categories)
const SkillsSchema = new Schema({}, { strict: false });
skillCategories.forEach((category) => {
  SkillsSchema.add({ [category]: [{ type: String, required: true }] });
});

// Main Resume Schema
const ResumeSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    contact: { type: ContactSchema, required: true },
    summary: { type: String, required: true },
    skills: { type: SkillsSchema, required: true },
    experiences: [{ type: ExperienceSchema, required: true }],
    education: [{ type: EducationSchema, required: true }],
  },
  {
    timestamps: true,
  }
);

export const ResumeModel = mongoose.model<IResume>("Resume", ResumeSchema);
