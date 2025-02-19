import { describe, it, expect, beforeEach } from "vitest";
import { ResumeModel } from "$models/resume.model";
import mongoose from "mongoose";

const mockResumeData = {
  name: "John Owolabi Idogun",
  title: "Software Engineer",
  contact: {
    phone: "+1234567890",
    email: "john@example.com",
    location: "Lagos, Nigeria",
    website: "https://example.com",
    linkedin: "linkedin.com/in/john",
    github: "github.com/john",
  },
  summary: "Experienced software engineer...",
  skills: {
    "Programming Languages": ["TypeScript", "JavaScript"],
    Frontend: ["React", "Vue"],
    Backend: ["Node.js", "Express"],
    Databases: ["MongoDB", "PostgreSQL"],
    "Cloud & DevOps": ["AWS", "Docker"],
    Other: ["Git", "REST APIs"],
  },
  experiences: [
    {
      role: "Senior Software Engineer",
      company: "Tech Corp",
      location: "Remote",
      companyDescription: "Leading tech company",
      period: "2020 - Present",
      techStack: ["TypeScript", "React", "Node.js"],
      achievements: ["Led team of 5 developers", "Improved performance by 50%"],
    },
  ],
  educations: [
    {
      degree: "BSc Computer Science",
      school: "University of Example",
      location: "Example City",
      period: "2015 - 2019",
      schoolDescription: "Top university",
      achievements: ["First Class Honours"],
    },
  ],
};

describe("Resume Model", () => {
  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
  describe("Singleton Pattern", () => {
    it("should enforce singleton ID", async () => {
      const resume = new ResumeModel(mockResumeData);
      await resume.save();

      expect(resume._id).toBe("JOHN_OWOLABI_IDOGUN_RESUME");
    });

    it("should prevent creating multiple resume documents", async () => {
      // Create first resume
      await ResumeModel.create(mockResumeData);

      // Attempt to create second resume
      await expect(ResumeModel.create(mockResumeData)).rejects.toThrow(
        "Only one resume document can exist"
      );
    });

    it("should always use singleton ID even if different ID provided", async () => {
      const resume = new ResumeModel({
        ...mockResumeData,
        _id: new mongoose.Types.ObjectId().toString(),
      });
      await resume.save();

      expect(resume._id).toBe("JOHN_OWOLABI_IDOGUN_RESUME");
    });
  });

  describe("createOrUpdate Static Method", () => {
    it("should create new resume if none exists", async () => {
      const resume = await ResumeModel.createOrUpdate(mockResumeData);

      expect(resume._id).toBe("JOHN_OWOLABI_IDOGUN_RESUME");
      expect(resume.name).toBe(mockResumeData.name);
    });

    it("should update existing resume", async () => {
      // Create initial resume
      await ResumeModel.createOrUpdate(mockResumeData);

      // Update resume
      const updatedData = {
        name: "John O. Idogun",
        title: "Senior Software Engineer",
      };

      const updated = await ResumeModel.createOrUpdate(updatedData);

      expect(updated.name).toBe("John O. Idogun");
      expect(updated.title).toBe("Senior Software Engineer");
      // Original data should be preserved
      expect(updated.contact.email).toBe(mockResumeData.contact.email);
    });

    it("should maintain singleton pattern during updates", async () => {
      // Create initial resume
      await ResumeModel.createOrUpdate(mockResumeData);

      // Update resume
      const updated = await ResumeModel.createOrUpdate({
        title: "Updated Title",
      });

      // Check document count
      const count = await ResumeModel.countDocuments();
      expect(count).toBe(1);
      expect(updated._id).toBe("JOHN_OWOLABI_IDOGUN_RESUME");
    });

    it("should set defaults on insert", async () => {
      const minimalData = {
        name: "John Idogun",
        title: "Developer",
        contact: {
          phone: "+1234567890",
          email: "john@example.com",
          location: "Lagos",
        },
        summary: "Summary",
        skills: {
          "Programming Languages": ["TypeScript"],
        },
        experiences: [],
        educations: [],
      };

      const resume = await ResumeModel.createOrUpdate(minimalData as any);

      expect(resume._id).toBe("JOHN_OWOLABI_IDOGUN_RESUME");
      // expect(resume.createdAt).toBeDefined();
      // expect(resume.updatedAt).toBeDefined();
    });
  });
});
