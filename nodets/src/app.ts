import express, { Application } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { connectToCluster, connectToRedis } from "$services/db.service.ts";
import { baseConfig } from "$config/base.config.ts";
import { AuthService } from "$services/auth.service.ts";
import authRoutes from "$routes/auth.routes.ts";
import { Providers } from "$types/misc.types.ts";
import { GitHubProfile } from "$types/auth.types.ts";
import type { User } from "$types/passports.d.ts";
import { handleAuthError } from "$middlewares/auth.middleware.ts";
import { ProviderMismatchError } from "$types/error.types.ts";
import { requestLogger } from "$middlewares/logger.middleware.ts";
import transactionRoutes from "$routes/transaction.routes.ts";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: baseConfig.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    store: baseConfig.redis_url ? connectToRedis() : new session.MemoryStore(),
    secret: baseConfig.auth.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
    },
  })
);

app.use(requestLogger);
app.use(passport.initialize());
app.use(passport.session());

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

// Health check
app.get("/api/v1/health", (req, res) => {
  baseConfig.logger.info("Health check endpoint called");
  res.status(200).json({ message: "Server is running" });
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
    app.listen(PORT, () => {
      baseConfig.logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    baseConfig.logger.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
