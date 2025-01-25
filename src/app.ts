import express, { Application } from "express";
import cors from "cors";
import session from "express-session";
import { createServer, Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { connectToCluster, connectToRedis } from "$services/db.service.js";
import { baseConfig } from "$config/base.config.js";
import { AuthService } from "$services/auth.service.js";
import authRoutes from "$routes/auth.routes.js";
import { Providers } from "$types/misc.types.js";
import { GitHubProfile } from "$types/auth.types.js";
import type { User } from "$types/passports.d.js";
import { handleAuthError } from "$middlewares/auth.middleware.js";
import { ProviderMismatchError } from "$types/error.types.js";
import { requestLogger } from "$middlewares/logger.middleware.js";
import transactionRoutes from "$routes/transaction.routes.js";
import { ApiDocumentationGenerator } from "$services/docs.services.js";
import endpointRouters from "$routes/docs.routes.js";
import { TransactionWebSocketHandler } from "$websockets/transaction.websocket.js";
import resumeRoutes from "$routes/resume.routes.js";
import articleRoutes from "$routes/article.routes.js";
import tagsRoutes from "$routes/tags.routes.js";
import seriesRoutes from "$routes/series.routes.js";

const app: Application = express();
const server: HttpServer = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// 1. Trust proxy setting
app.set("trust proxy", 1);

// 2. Basic middleware
app.use(express.json());

// 3. CORS configuration
app.use(
  cors({
    origin: baseConfig.frontendUrl,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
      "TRACE",
      "CONNECT",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// 4. Session configuration
app.use(
  session({
    store: baseConfig.redisUrl ? connectToRedis() : new session.MemoryStore(),
    secret: baseConfig.auth.session.secret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "production"
          ? baseConfig.cookieDomain
          : undefined,
    },
  })
);

// 5. Authentication middleware
app.use(passport.initialize());
app.use(passport.session());

// 6. Application middleware
app.use(requestLogger);

passport.serializeUser<User>((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: User, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    baseConfig.auth.google,
    async (
      accessToken: any,
      refreshToken: any,
      profile,
      done: (error: any, user?: any, options?: { message: string }) => void
    ) => {
      try {
        const user = await AuthService.findOrCreateUser({
          id: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
          provider: "google",
          providerId: Providers.GOOGLE,
          avatar: profile.photos![0].value,
        });
        return done(null, user);
      } catch (error) {
        if ((error as Error).message.includes("Please login with")) {
          return done(null, false, { message: (error as Error).message });
        }
        return done(error as Error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    baseConfig.auth.github,
    async (
      accessToken: any,
      refreshToken: any,
      profile: GitHubProfile,
      done: (error: any, user?: any, options?: { message: string }) => void
    ) => {
      try {
        const user = await AuthService.findOrCreateUser({
          id: profile.id,
          email: profile.emails?.[0].value,
          provider: profile.provider,
          providerId: Providers.GITHUB,
          avatar: profile.photos?.[0].value,
          name: profile.displayName,
        });
        return done(null, user);
      } catch (error) {
        if (error instanceof ProviderMismatchError) {
          return done(null, false, { message: error.message });
        }
        return done(error);
      }
    }
  )
);

// Authentication routes
app.use("/api/v1/auth", authRoutes);
app.use(handleAuthError);

// Transaction routes
app.use("/api/v1/transactions", transactionRoutes);

// Resume routes
app.use("/api/v1/resumes", resumeRoutes);

// Article routes
app.use("/api/v1/articles", articleRoutes);

// Tag routes
app.use("/api/v1/tags", tagsRoutes);

// Series routes
app.use("/api/v1/series", seriesRoutes);

// Handle WebSocket connections
wss.on("connection", (ws) => {
  TransactionWebSocketHandler(ws);
});

// Health check
app.get("/api/v1/health", (req, res) => {
  baseConfig.logger.info("Health check endpoint called");
  res.status(200).json({ message: "Server is running" });
});

// API documentation routes
app.use("/api/v1/docs", endpointRouters);

// Endpoint to generate API documentation
app.get("/api/docs", (req, res) => {
  const docs = ApiDocumentationGenerator.generate(app);
  res.json(docs);
});

const startServer = async () => {
  try {
    baseConfig.logger.info("Connecting to MongoDB cluster...");
    const db = await connectToCluster();

    if (!db.readyState) {
      throw new Error("MongoDB connection not ready");
    }

    baseConfig.logger.info("Connected to MongoDB cluster");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      baseConfig.logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    baseConfig.logger.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
