import mongoose, { Schema, Document, Model } from "mongoose";
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
  "Other",
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

const SINGLETON_ID = "JOHN_OWOLABI_IDOGUN_RESUME" as const;
interface ResumeModel extends Model<IResume> {
  createOrUpdate(data: Partial<IResume>): Promise<IResume>;
}

const ResumeSchema = new Schema(
  {
    _id: {
      type: String,
      default: SINGLETON_ID,
      required: true,
      immutable: true,
    },
    name: { type: String, required: true },
    title: { type: String, required: true },
    contact: { type: ContactSchema, required: true },
    summary: { type: String, required: true },
    skills: { type: SkillsSchema, required: true },
    experiences: [{ type: ExperienceSchema, required: true }],
    educations: [{ type: EducationSchema, required: true }],
  },
  {
    timestamps: true,
  }
);

// Enforce singleton pattern
ResumeSchema.pre("save", async function (next) {
  if (this._id !== SINGLETON_ID) {
    this._id = SINGLETON_ID;
  }
  const count = await mongoose.model("Resume").countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error("Only one resume document can exist");
  }
  next();
});

// Static method for upsert operations
ResumeSchema.statics.createOrUpdate = async function (data: Partial<IResume>) {
  return this.findOneAndUpdate(
    { _id: SINGLETON_ID },
    { ...data },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const ResumeModel = mongoose.model<IResume, ResumeModel>(
  "Resume",
  ResumeSchema
);
