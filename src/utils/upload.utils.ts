import type { Request } from "express";
import Busboy from "busboy";

export interface UploadFileInfo {
  filename: string;
  mimeType: string;
  encoding: string;
}

export type UploadFileHandler<T> = (
  buffer: Buffer,
  info: UploadFileInfo
) => Promise<T>;

// For testing we allow injecting a custom busboy factory.
export type BusboyFactory = (headers: any) => NodeJS.WritableStream;

/**
 * processFileUpload abstracts the common Busboy-based file processing.
 *
 * It creates a Busboy instance from the request headers, listens for the first file,
 * collects its chunks, and when the file stream ends it calls the provided `fileHandler`
 * with the complete file buffer and metadata.
 *
 * If multiple files are received or an error occurs, the promise is rejected.
 */
export async function processFileUpload<T>(
  req: Request,
  fileHandler: UploadFileHandler<T>,
  busboyFactory: BusboyFactory = (headers) =>
    Busboy({ headers }) as NodeJS.WritableStream
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const bb = busboyFactory(req.headers);
    let fileProcessed = false;
    bb.on(
      "file",
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: UploadFileInfo
      ) => {
        if (fileProcessed) {
          return reject(new Error("Only one file is allowed"));
        }
        fileProcessed = true;
        const chunks: Buffer[] = [];
        file.on("data", (chunk: Buffer) => chunks.push(chunk));
        file.on("end", async () => {
          const fileBuffer = Buffer.concat(chunks);
          try {
            const result = await fileHandler(fileBuffer, info);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    bb.on("error", (err: Error) => reject(err));
    req.pipe(bb);
  });
}
