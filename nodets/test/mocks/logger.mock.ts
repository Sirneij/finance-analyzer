import winston from "winston";

export const createMockLogger = () =>
  ({
    error: jest.fn().mockImplementation((message: string) => {
      console.error(message); // This helps with debugging
      return true;
    }),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    silent: false as const, // Use const assertion
    format: winston.format.json(),
    levels: winston.config.npm.levels,
    level: "error" as const,
    transports: [],
    log: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  } as unknown as winston.Logger);
