import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const structure = {
  test: {
    config: ["base.config.test.ts"],
    controllers: [
      "auth.controller.test.ts",
      "docs.controller.test.ts",
      "transaction.controller.test.ts",
    ],
    middlewares: ["auth.middleware.test.ts", "logger.middleware.test.ts"],
    models: [
      "docs.model.test.ts",
      "insights.model.test.ts",
      "transaction.model.test.ts",
      "user.model.test.ts",
    ],
    routes: [
      "auth.routes.test.ts",
      "docs.routes.test.ts",
      "transaction.routes.test.ts",
    ],
    services: [
      "auth.service.test.ts",
      "db.service.test.ts",
      "docs.services.test.ts",
      "transaction.service.test.ts",
    ],
    utils: {
      files: [
        "docs.utils.test.ts",
        "error.utils.test.ts",
        "file.utils.test.ts",
      ],
      parsers: [
        "csv.parsers.test.ts",
        "factory.parsers.test.ts",
        "pdf.parsers.test.ts",
      ],
    },
  },
};

function createStructure(basePath, structure) {
  for (const key in structure) {
    const currentPath = path.join(basePath, key);

    if (Array.isArray(structure[key])) {
      // If the value is an array, create the folder and files
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
      }
      structure[key].forEach((file) => {
        const filePath = path.join(currentPath, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `// ${file}\n`, "utf-8");
        }
      });
    } else if (typeof structure[key] === "object") {
      // If the value is an object, recursively create its structure
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
      }
      createStructure(currentPath, structure[key]);
    }
  }
}

// Run the script
const basePath = path.resolve(__dirname, "test");
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}
createStructure(basePath, structure);

console.log("Test structure created successfully!");
