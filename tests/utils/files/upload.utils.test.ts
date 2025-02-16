/// <reference types="vitest" />
import {
  processFileUpload,
  type UploadFileInfo,
  type UploadFileHandler,
  type BusboyFactory,
} from "$utils/upload.utils.js";
import { PassThrough } from "stream";
import { describe, it, expect, vi } from "vitest";
import type { Request } from "express";

// Create a fake Busboy that extends PassThrough so it’s a Writable stream.
class FakeBusboy extends PassThrough {}

// Helper to create a fake request stream with headers.
function createFakeRequest(headers: any = {}): Request {
  const req = new PassThrough() as unknown as Request;
  req.headers = headers;
  // We'll override pipe() in each test.
  req.pipe = vi.fn();
  return req;
}

describe.concurrent("processFileUpload", () => {
  it("should process a valid file and resolve with the fileHandler result", async () => {
    const fakeBusboy = new FakeBusboy();
    const fakeBusboyFactory: BusboyFactory = (headers) => fakeBusboy;
    const fakeRequest = createFakeRequest({
      "content-type": "multipart/form-data",
    });

    fakeRequest.pipe = vi.fn((dest: any) => {
      // Simulate a file event.
      const fakeFile = new PassThrough();
      const info: UploadFileInfo = {
        filename: "test.pdf",
        mimeType: "application/pdf",
        encoding: "7bit",
      };
      dest.emit("file", "file", fakeFile, info);
      // Simulate file data events.
      fakeFile.emit("data", Buffer.from("Hello, "));
      fakeFile.emit("data", Buffer.from("world!"));
      fakeFile.emit("end");
      return dest;
    });

    // fileHandler simply returns the file contents appended with a string.
    const fileHandler: UploadFileHandler<string> = async (buffer, info) => {
      return buffer.toString() + " processed";
    };

    const result = await processFileUpload(
      fakeRequest,
      fileHandler,
      fakeBusboyFactory
    );
    expect(result).toBe("Hello, world! processed");
  });

  it("should reject if multiple files are provided", async () => {
    const fakeBusboy = new FakeBusboy();
    const fakeBusboyFactory: BusboyFactory = (headers) => fakeBusboy;
    const fakeRequest = createFakeRequest({
      "content-type": "multipart/form-data",
    });

    fakeRequest.pipe = vi.fn((dest: any) => {
      // Emit first file event.
      const fakeFile1 = new PassThrough();
      const info1: UploadFileInfo = {
        filename: "file1.txt",
        mimeType: "text/plain",
        encoding: "7bit",
      };
      dest.emit("file", "file", fakeFile1, info1);
      fakeFile1.emit("data", Buffer.from("data1"));
      fakeFile1.emit("end");

      // Emit a second file event.
      const fakeFile2 = new PassThrough();
      const info2: UploadFileInfo = {
        filename: "file2.txt",
        mimeType: "text/plain",
        encoding: "7bit",
      };
      dest.emit("file", "file", fakeFile2, info2);
      fakeFile2.emit("data", Buffer.from("data2"));
      fakeFile2.emit("end");

      return dest;
    });

    const fileHandler: UploadFileHandler<string> = async (buffer, info) => {
      return "should not reach here";
    };

    await expect(
      processFileUpload(fakeRequest, fileHandler, fakeBusboyFactory)
    ).rejects.toThrow("Only one file is allowed");
  });

  it("should reject if fileHandler throws an error", async () => {
    const fakeBusboy = new FakeBusboy();
    const fakeBusboyFactory: BusboyFactory = (headers) => fakeBusboy;
    const fakeRequest = createFakeRequest({
      "content-type": "multipart/form-data",
    });

    fakeRequest.pipe = vi.fn((dest: any) => {
      const fakeFile = new PassThrough();
      const info: UploadFileInfo = {
        filename: "error.txt",
        mimeType: "text/plain",
        encoding: "7bit",
      };
      dest.emit("file", "file", fakeFile, info);
      fakeFile.emit("data", Buffer.from("error data"));
      fakeFile.emit("end");

      return dest;
    });

    const fileHandler: UploadFileHandler<string> = async (buffer, info) => {
      throw new Error("Handler error");
    };

    await expect(
      processFileUpload(fakeRequest, fileHandler, fakeBusboyFactory)
    ).rejects.toThrow("Handler error");
  });

  it("should reject if busboy emits an error", async () => {
    const fakeBusboy = new FakeBusboy();
    const fakeBusboyFactory: BusboyFactory = (headers) => fakeBusboy;
    const fakeRequest = createFakeRequest({
      "content-type": "multipart/form-data",
    });

    fakeRequest.pipe = vi.fn((dest: any) => {
      dest.emit("error", new Error("Busboy error"));
      return dest;
    });

    const fileHandler: UploadFileHandler<string> = async (buffer, info) => {
      return "should not be called";
    };

    await expect(
      processFileUpload(fakeRequest, fileHandler, fakeBusboyFactory)
    ).rejects.toThrow("Busboy error");
  });
});
