import { baseConfig } from "$config/base.config.js";
import { ResumeModel } from "$models/resume.model.js";
import { Resume } from "$types/resume.types.js";

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
      `${baseConfig.utility_service_url}/parse-resume`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    await ResumeModel.createOrUpdate(data);

    return data as Resume;
  }
}
