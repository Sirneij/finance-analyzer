import winston from "winston";
import { Writable } from "stream";

describe("Logger Configuration", () => {
  const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  );

  it("should format log messages correctly", () => {
    // Array to capture log messages
    const logs: string[] = [];

    // Mock the timestamp to return a fixed date
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00Z"));

    // Create a writable stream to capture log messages
    const testStream = new Writable({
      write(chunk, encoding, callback) {
        logs.push(chunk.toString().trim()); // Trim the message to remove extra newline
        callback(); // Signal that the write is complete
      },
    });

    // Create the logger with the custom transport
    const logger = winston.createLogger({
      format: developmentFormat,
      transports: [
        new winston.transports.Stream({
          stream: testStream,
        }),
      ],
    });

    // Log a test message
    logger.info("Test log message");

    // Validate the captured log message
    expect(logs).toContain("2023-01-01 07:00:00 info: Test log message");

    // Restore timers
    jest.useRealTimers();
  });
});
