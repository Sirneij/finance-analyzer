import app from "../../src/app";
import request from "supertest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware";
import { BASE_URL } from "../setupEnv";
import { clearDatabase } from "../setupMongo";

// Mock middleware and controller
vi.mock("$middlewares/auth.middleware", () => ({
  isJohnOwolabiIdogun: vi.fn((req, res, next) => next()),
  isAuthenticated: vi.fn((req, res, next) => next()),
  handleAuthError: vi.fn((err, req, res, next) => {
    if (err.name === "ProviderMismatchError") {
      res.status(401).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }),
}));

vi.mock("$controllers/article.controller", () => ({
  ArticleController: vi.fn().mockImplementation(() => ({
    handleFileUpload: vi.fn((req, res) => res.json({ success: true })),
    handleFileDelete: vi.fn((req, res) => res.json({ success: true })),
    handleArticleCreate: vi.fn((req, res) => res.json({ success: true })),
    handleGetArticles: vi.fn((req, res) => res.json({ articles: [] })),
    handleGetAllArticles: vi.fn((req, res) => res.json({ articles: [] })),
    handleSearchArticles: vi.fn((req, res) => res.json({ articles: [] })),
    handleGetArticleStats: vi.fn((req, res) => res.json({ stats: {} })),
    handleTogglePublish: vi.fn((req, res) => res.json({ success: true })),
    handleBatchArticleDelete: vi.fn((req, res) => res.json({ success: true })),
    handleGetArticle: vi.fn((req, res) => res.json({ article: {} })),
    handleArticleUpdate: vi.fn((req, res) => res.json({ success: true })),
    handleArticleDelete: vi.fn((req, res) => res.json({ success: true })),
  })),
}));

describe("Article Routes", () => {
  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    // Clear database
    await clearDatabase();
  });

  describe("Protected Routes", () => {
    it("should protect file upload route", async () => {
      await request(app).post(`${BASE_URL}/articles/upload`).expect(200);

      expect(isJohnOwolabiIdogun).toHaveBeenCalled();
    });

    it("should protect file delete route", async () => {
      await request(app)
        .delete(`${BASE_URL}/articles/delete-upload`)
        .expect(200);

      expect(isJohnOwolabiIdogun).toHaveBeenCalled();
    });

    it("should protect article creation route", async () => {
      await request(app).post(`${BASE_URL}/articles`).expect(200);

      expect(isJohnOwolabiIdogun).toHaveBeenCalled();
    });

    // Add more protected route tests...
  });
});
