const config = {
  preset: "ts-jest/presets/default-esm", // Changed preset path
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    "^\\$config/(.*)$": "<rootDir>/src/config/$1",
    "^\\$services/(.*)$": "<rootDir>/src/services/$1",
    "^\\$controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^\\$middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^\\$routes/(.*)$": "<rootDir>/src/routes/$1",
    "^\\$models/(.*)$": "<rootDir>/src/models/$1",
    "^\\$utils/(.*)$": "<rootDir>/src/utils/$1",
    "^\\$types/(.*)$": "<rootDir>/src/types/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/types/**/*.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
