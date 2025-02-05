I want to write an article about how to build AI-powered financial data analyzer using NodeJS, Python (PyTorch, aiohttp, and Huggingface transformers), SvelteKit (with Websocket support) and Tailwind CSS v4. Modify this script to generate a PNG banner for the post using the technologies' logos.

The architecture of the application is that SvelteKit (with svelte 5 and tailwindcss v4) consumes REST apis from NodeJS.

NodeJS (using expressjs) is the backbone of the application with the following responsibilities:

1. Authenticating users via OAuth (GitHub and Google, only GitHub has been implemented for now) and storing their basic information in a MongoDB database.
2. Provides REST APIs for parsing transaction data (in CSV, PDF and Excel formats, excel still under development) and storing the parsed data in the database.
3. Serves as a middleman that sends users data to a Python server which analyzes the data and return the analyzed data back to NodeJS which in turn sends them to the frontend. This middleman role is needed since NodeJS needs to authenticate users and filter transactions based on that before analysis. Websocket is used for this communication.

The `aiohttp` backed Python server does very specific things:

1. Using `pdf2image` and `pytesseract`, parse a PDF which has transaction data and send them back to NodeJS to save in the DB (http communication)
2. Using `PyTorch`, `transformers`, `numpy`, `pandas` and `sklearn`, analyze transaction data by categorizing them as income/expenses, calculating savings rate, total transactions and so on and sending the result back to NodeJS which in turn sends it (without saving) to the frontend via Websockets.

SvelteKit frontend:

1. Powered by svelte 5, it allows user registration via GitHub (for now), a requirement for all users.
2. Provides intuitive interface for users to either upload a file or manually input data in a form.
3. Using chartjs, provides very interactive charts for users based on their transaction data and provides a very nice and intuitive dashboard for user's displaying financial data and charts in very fancy ways.

I have an express app that works and I need to write automated tests. I have two tsconfig.json files: one for the normal app (tsconfig.json) and the other for tests (tsconfig.test.json):

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "allowJs": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["node"],
    "paths": {
      "$config/*": ["src/config/*"],
      "$controllers/*": ["src/controllers/*"],
      "$models/*": ["src/models/*"],
      "$routes/*": ["src/routes/*"],
      "$services/*": ["src/services/*"],
      "$types/*": ["src/types/*"],
      "$middlewares/*": ["src/middlewares/*"],
      "$utils/*": ["src/utils/*"],
      "$websockets/*": ["src/websockets/*"]
    },
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "test/**/*",
    "jest.setup.js"
  ]
}

// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  "exclude": ["node_modules", "dist"]
}
```

I am using jest and I have `jest.config.ts`:

```ts
const config = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleDirectories: ["node_modules", "src"],
  collectCoverageFrom: ["src/**/*.ts", "!src/types/**/*.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js"],
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
};

export default config;
```

I have this directory:

```sh
.
├── Procfile
├── README.md
├── create-test-structure.js
├── financial.code-workspace
├── jest.config.js
├── jest.setup.ts
├── package-lock.json
├── package.json
├── script.py
├── src
│   ├── app.ts
│   ├── config
│   │   ├── base.config.ts
│   │   └── internal
│   │       ├── auth.config.ts
│   │       ├── db.config.ts
│   │       └── logger.config.ts
│   ├── controllers
│   │   ├── article.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── docs.controller.ts
│   │   ├── resume.controller.ts
│   │   ├── series.controller.ts
│   │   ├── tags.controller.ts
│   │   └── transaction.controller.ts
│   ├── middlewares
│   │   ├── auth.middleware.ts
│   │   └── logger.middleware.ts
│   ├── models
│   │   ├── article.model.ts
│   │   ├── docs.model.ts
│   │   ├── resume.model.ts
│   │   ├── transaction.model.ts
│   │   └── user.model.ts
│   ├── routes
│   │   ├── article.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── docs.routes.ts
│   │   ├── resume.routes.ts
│   │   ├── series.routes.ts
│   │   ├── tags.routes.ts
│   │   └── transaction.routes.ts
│   ├── services
│   │   ├── article.service.ts
│   │   ├── auth.service.ts
│   │   ├── db.service.ts
│   │   ├── docs.services.ts
│   │   ├── resume.service.ts
│   │   ├── series.service.ts
│   │   ├── tags.service.ts
│   │   └── transaction.service.ts
│   ├── test.ts
│   ├── types
│   │   ├── article.types.ts
│   │   ├── auth.types.ts
│   │   ├── bun
│   │   ├── db.types.ts
│   │   ├── docs.types.ts
│   │   ├── error.types.ts
│   │   ├── files.types.ts
│   │   ├── misc.types.ts
│   │   ├── passports.d.ts
│   │   ├── resume.types.ts
│   │   └── transaction.types.ts
│   ├── utils
│   │   ├── article.utils.ts
│   │   ├── certs.utils.ts
│   │   ├── docs.utils.ts
│   │   ├── error.utils.ts
│   │   ├── file.utils.ts
│   │   └── parsers
│   │       ├── csv.parsers.ts
│   │       ├── factory.parsers.ts
│   │       └── pdf.parsers.ts
│   └── websockets
│       └── transaction.websocket.ts
├── test
│   ├── config
│   │   ├── base.config.test.ts
│   │   └── logger.config.test.ts
│   ├── controllers
│   │   ├── auth.controller.test.ts
│   │   ├── docs.controller.test.ts
│   │   └── transaction.controller.test.ts
│   ├── middlewares
│   │   ├── auth.middleware.test.ts
│   │   └── logger.middleware.test.ts
│   ├── mocks
│   │   └── logger.mock.ts
│   ├── models
│   │   ├── docs.model.test.ts
│   │   ├── insights.model.test.ts
│   │   ├── transaction.model.test.ts
│   │   └── user.model.test.ts
│   ├── routes
│   │   ├── auth.routes.test.ts
│   │   ├── docs.routes.test.ts
│   │   └── transaction.routes.test.ts
│   ├── services
│   │   ├── auth.service.test.ts
│   │   ├── db.service.test.ts
│   │   ├── docs.services.test.ts
│   │   └── transaction.service.test.ts
│   └── utils
│       ├── files
│       │   ├── docs.utils.test.ts
│       │   ├── error.utils.test.ts
│       │   └── file.utils.test.ts
│       └── parsers
│           ├── csv.parsers.test.ts
│           ├── factory.parsers.test.ts
│           └── pdf.parsers.test.ts
├── test_README.md
├── tsconfig.json
└── tsconfig.test.json

25 directories, 91 files
```

I however have these errors while running the tests:

```
financial git:(nodets) ✗ npm test

> ai-powered-financial-behavior-analyzer@1.0.0 test
> jest --config jest.config.js

 PASS  test/routes/docs.routes.test.ts (5.856 s)
 PASS  test/services/transaction.service.test.ts (5.915 s)
 PASS  test/models/user.model.test.ts (6.042 s)
 PASS  test/routes/auth.routes.test.ts (6.117 s)
 PASS  test/middlewares/logger.middleware.test.ts (6.173 s)
 PASS  test/utils/files/docs.utils.test.ts (6.176 s)
 PASS  test/services/docs.services.test.ts (6.181 s)
 PASS  test/services/auth.service.test.ts (6.194 s)
 PASS  test/routes/transaction.routes.test.ts (6.2 s)
 PASS  test/services/db.service.test.ts (6.253 s)
 FAIL  test/utils/parsers/factory.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/factory.parsers.js' from 'test/utils/parsers/factory.parsers.test.ts'

      1 | // factory.parsers.test.js
      2 | import mongoose from "mongoose";
    > 3 | import { ParserFactory } from "$utils/parsers/factory.parsers.js";
        | ^
      4 | import { CSVParser } from "$utils/parsers/csv.parsers.js";
      5 | import { PDFParser } from "$utils/parsers/pdf.parsers.js";
      6 | import { SupportedFileTypes } from "$types/files.types.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/factory.parsers.test.ts:3:1)

 FAIL  test/utils/files/error.utils.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/error.utils.js' from 'test/utils/files/error.utils.test.ts'

    > 1 | import { sendAuthError } from "$utils/error.utils.js";
        | ^
      2 | import { AuthError, AuthErrorType } from "$types/error.types.js";
      3 | import { baseConfig } from "$config/base.config.js";
      4 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/files/error.utils.test.ts:1:1)

 FAIL  test/utils/files/file.utils.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/file.utils.js' from 'test/utils/files/file.utils.test.ts'

    > 1 | import { BaseParser } from "$utils/file.utils.js";
        | ^
      2 | import mongoose from "mongoose";
      3 | import { RawTransaction } from "$types/transaction.types.js";
      4 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/files/file.utils.test.ts:1:1)

 FAIL  test/middlewares/auth.middleware.test.ts
  ● Test suite failed to run

    Cannot find module '$middlewares/auth.middleware.js' from 'test/middlewares/auth.middleware.test.ts'

    > 1 | import {
        | ^
      2 |   isAuthenticated,
      3 |   handleAuthError,
      4 | } from "$middlewares/auth.middleware.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/middlewares/auth.middleware.test.ts:1:1)

 FAIL  test/utils/parsers/pdf.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/pdf.parsers.js' from 'test/utils/parsers/pdf.parsers.test.ts'

      1 | // pdf.parsers.test.js
    > 2 | import { PDFParser } from "$utils/parsers/pdf.parsers.js";
        | ^
      3 | import { ITransaction } from "$types/transaction.types.js";
      4 | import mongoose from "mongoose";
      5 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/pdf.parsers.test.ts:2:1)

 FAIL  test/utils/parsers/csv.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/csv.parsers.js' from 'test/utils/parsers/csv.parsers.test.ts'

      1 | // csv.parsers.test.js
    > 2 | import { CSVParser } from "$utils/parsers/csv.parsers.js";
        | ^
      3 | import { ITransaction } from "$types/transaction.types.js";
      4 | import { PassThrough } from "stream";
      5 | import mongoose from "mongoose";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/csv.parsers.test.ts:2:1)

 PASS  test/models/transaction.model.test.ts
 FAIL  test/config/base.config.test.ts
  ● Test suite failed to run

    Cannot find module '$config/base.config.js' from 'test/config/base.config.test.ts'

    > 1 | import { baseConfig } from "$config/base.config.js";
        | ^
      2 |
      3 | describe("baseConfig", () => {
      4 |   const originalEnv = process.env;

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/config/base.config.test.ts:1:1)

 FAIL  test/controllers/transaction.controller.test.ts
  ● Test suite failed to run

    test/controllers/transaction.controller.test.ts:3:39 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

    3 import { TransactionController } from "$controllers/transaction.controller.ts";
                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 FAIL  test/controllers/auth.controller.test.ts
  ● Test suite failed to run

    Cannot find module '$controllers/auth.controller.js' from 'test/controllers/auth.controller.test.ts'

    > 1 | import { AuthController } from "$controllers/auth.controller.js";
        | ^
      2 | import mongoose from "mongoose";
      3 | import { createMockLogger } from "../mocks/logger.mock.js";
      4 | import type { Request, Response } from "express";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/controllers/auth.controller.test.ts:1:1)

 FAIL  test/controllers/docs.controller.test.ts
  ● Test suite failed to run

    Cannot find module '$controllers/docs.controller.js' from 'test/controllers/docs.controller.test.ts'

    > 1 | import { EndpointController } from "$controllers/docs.controller.js";
        | ^
      2 | import { IEndpoint } from "$models/docs.model.js";
      3 | import { EndpointService } from "$services/docs.services.js";
      4 | import { HttpMethod } from "$types/docs.types.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/controllers/docs.controller.test.ts:1:1)

 PASS  test/models/docs.model.test.ts
 PASS  test/config/logger.config.test.ts
 PASS  test/models/insights.model.test.ts
A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.

Summary of all failing tests
 FAIL  test/utils/parsers/factory.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/factory.parsers.js' from 'test/utils/parsers/factory.parsers.test.ts'

      1 | // factory.parsers.test.js
      2 | import mongoose from "mongoose";
    > 3 | import { ParserFactory } from "$utils/parsers/factory.parsers.js";
        | ^
      4 | import { CSVParser } from "$utils/parsers/csv.parsers.js";
      5 | import { PDFParser } from "$utils/parsers/pdf.parsers.js";
      6 | import { SupportedFileTypes } from "$types/files.types.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/factory.parsers.test.ts:3:1)

 FAIL  test/utils/files/error.utils.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/error.utils.js' from 'test/utils/files/error.utils.test.ts'

    > 1 | import { sendAuthError } from "$utils/error.utils.js";
        | ^
      2 | import { AuthError, AuthErrorType } from "$types/error.types.js";
      3 | import { baseConfig } from "$config/base.config.js";
      4 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/files/error.utils.test.ts:1:1)

 FAIL  test/utils/files/file.utils.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/file.utils.js' from 'test/utils/files/file.utils.test.ts'

    > 1 | import { BaseParser } from "$utils/file.utils.js";
        | ^
      2 | import mongoose from "mongoose";
      3 | import { RawTransaction } from "$types/transaction.types.js";
      4 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/files/file.utils.test.ts:1:1)

 FAIL  test/middlewares/auth.middleware.test.ts
  ● Test suite failed to run

    Cannot find module '$middlewares/auth.middleware.js' from 'test/middlewares/auth.middleware.test.ts'

    > 1 | import {
        | ^
      2 |   isAuthenticated,
      3 |   handleAuthError,
      4 | } from "$middlewares/auth.middleware.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/middlewares/auth.middleware.test.ts:1:1)

 FAIL  test/utils/parsers/pdf.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/pdf.parsers.js' from 'test/utils/parsers/pdf.parsers.test.ts'

      1 | // pdf.parsers.test.js
    > 2 | import { PDFParser } from "$utils/parsers/pdf.parsers.js";
        | ^
      3 | import { ITransaction } from "$types/transaction.types.js";
      4 | import mongoose from "mongoose";
      5 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/pdf.parsers.test.ts:2:1)

 FAIL  test/utils/parsers/csv.parsers.test.ts
  ● Test suite failed to run

    Cannot find module '$utils/parsers/csv.parsers.js' from 'test/utils/parsers/csv.parsers.test.ts'

      1 | // csv.parsers.test.js
    > 2 | import { CSVParser } from "$utils/parsers/csv.parsers.js";
        | ^
      3 | import { ITransaction } from "$types/transaction.types.js";
      4 | import { PassThrough } from "stream";
      5 | import mongoose from "mongoose";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/utils/parsers/csv.parsers.test.ts:2:1)

 FAIL  test/config/base.config.test.ts
  ● Test suite failed to run

    Cannot find module '$config/base.config.js' from 'test/config/base.config.test.ts'

    > 1 | import { baseConfig } from "$config/base.config.js";
        | ^
      2 |
      3 | describe("baseConfig", () => {
      4 |   const originalEnv = process.env;

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/config/base.config.test.ts:1:1)

 FAIL  test/controllers/transaction.controller.test.ts
  ● Test suite failed to run

    test/controllers/transaction.controller.test.ts:3:39 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

    3 import { TransactionController } from "$controllers/transaction.controller.ts";
                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 FAIL  test/controllers/auth.controller.test.ts
  ● Test suite failed to run

    Cannot find module '$controllers/auth.controller.js' from 'test/controllers/auth.controller.test.ts'

    > 1 | import { AuthController } from "$controllers/auth.controller.js";
        | ^
      2 | import mongoose from "mongoose";
      3 | import { createMockLogger } from "../mocks/logger.mock.js";
      4 | import type { Request, Response } from "express";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/controllers/auth.controller.test.ts:1:1)

 FAIL  test/controllers/docs.controller.test.ts
  ● Test suite failed to run

    Cannot find module '$controllers/docs.controller.js' from 'test/controllers/docs.controller.test.ts'

    > 1 | import { EndpointController } from "$controllers/docs.controller.js";
        | ^
      2 | import { IEndpoint } from "$models/docs.model.js";
      3 | import { EndpointService } from "$services/docs.services.js";
      4 | import { HttpMethod } from "$types/docs.types.js";

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (test/controllers/docs.controller.test.ts:1:1)


Test Suites: 10 failed, 14 passed, 24 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        8.365 s
Ran all test suites.
```
