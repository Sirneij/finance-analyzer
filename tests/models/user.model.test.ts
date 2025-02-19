import { describe, it, expect, beforeEach } from "vitest";
import { User } from "$models/user.model";
import { clearDatabase } from "../setupMongo";

describe("User Model", () => {
  beforeEach(async () => {
    // Clear all collections before each test
    await clearDatabase();
  });

  describe("Schema Validation", () => {
    it("should create a valid user", async () => {
      const validUser = {
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
        name: "John Owolabi Idogun",
        avatar: "https://example.com/avatar.jpg",
        isJohnOwolabiIdogun: true,
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.provider).toBe(validUser.provider);
      expect(savedUser.providerId).toBe(validUser.providerId);
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.avatar).toBe(validUser.avatar);
      expect(savedUser.isJohnOwolabiIdogun).toBe(validUser.isJohnOwolabiIdogun);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it("should fail without required fields", async () => {
      const userWithoutRequired = {
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
      };

      const user = new User(userWithoutRequired);
      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce email uniqueness", async () => {
      const userData = {
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
      };

      // Create first user
      await User.create(userData);

      // Attempt to create second user with same email
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("Default Values", () => {
    it("should set default values correctly", async () => {
      const userWithoutDefaults = {
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
      };

      const user = await User.create(userWithoutDefaults);

      expect(user.avatar).toBeNull();
      expect(user.isJohnOwolabiIdogun).toBe(false);
    });
  });

  describe("Timestamps", () => {
    it("should set createdAt and updatedAt", async () => {
      const user = await User.create({
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
      });

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on changes", async () => {
      const user = await User.create({
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      user.name = "Updated Name";
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Type Safety", () => {
    it("should handle different provider IDs", async () => {
      const user = await User.create({
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
      });

      expect(typeof user.providerId).toBe("number");
    });

    it("should handle boolean isJohnOwolabiIdogun", async () => {
      const user = await User.create({
        email: "john@example.com",
        provider: "github",
        providerId: 12345,
        isJohnOwolabiIdogun: true,
      });

      expect(typeof user.isJohnOwolabiIdogun).toBe("boolean");
    });
  });
});
