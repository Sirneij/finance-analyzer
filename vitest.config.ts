import { defineConfig } from "vitest/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "tests/**/*",
        "node_modules/**/*",
        "dist/**/*",
        "coverage/**/*",
        "src/types/**/*",
        "./create-test-structure.ts",
        "./setup.node.ts",
        "./vitest.config.ts",
      ],
    },
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setupEnv.ts"],
    include: ["./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
  resolve: {
    alias: [
      {
        find: /^\$models\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/models/$1.ts"),
      },
      {
        find: /^\$services\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/services/$1.ts"),
      },
      {
        find: /^\$config\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/config/$1.ts"),
      },
      {
        find: /^\$routes\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/routes/$1.ts"),
      },
      {
        find: /^\$types\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/types/$1.ts"),
      },
      {
        find: /^\$middlewares\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/middlewares/$1.ts"),
      },
      {
        find: /^\$websockets\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/websockets/$1.ts"),
      },
      {
        find: /^\$utils\/(.*)\.js$/,
        replacement: path.resolve(__dirname, "src/utils/$1.ts"),
      },
    ],
  },
});
