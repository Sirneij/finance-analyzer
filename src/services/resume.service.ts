import { baseConfig } from "$config/base.config.js";
import { ResumeModel, type IResume } from "$models/resume.model.js";
import type { Resume } from "$types/resume.types.js";

export class ResumeService {
  static async getResume(id: string): Promise<Resume | null> {
    return await ResumeModel.findById(id);
  }

  static async createResume(buffer: Buffer): Promise<Resume> {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([buffer], { type: "application/pdf" }),
      "resume.pdf"
    );

    const response = await fetch(
      `${baseConfig.utilityServiceUrl}/parse-resume`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = (await response.json()) as Partial<IResume>;

    await ResumeModel.createOrUpdate(data);

    return data as Resume;
  }
}
