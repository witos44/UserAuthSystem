import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

// JWT token utilities
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Token utilities
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Passport configuration
export function configurePassport() {
  // Local strategy
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user) {
          // Check if user exists with same email
          const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
          if (existingUser) {
            // Link Google account to existing user
            user = await storage.updateUser(existingUser.id, {
              googleId: profile.id,
              profileImageUrl: profile.photos?.[0]?.value
            });
          } else {
            // Create new user
            user = await storage.createUser({
              email: profile.emails?.[0]?.value || "",
              googleId: profile.id,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
              emailVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // GitHub strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByGithubId(profile.id);
        
        if (!user) {
          // Check if user exists with same email
          const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
          if (existingUser) {
            // Link GitHub account to existing user
            user = await storage.updateUser(existingUser.id, {
              githubId: profile.id,
              profileImageUrl: profile.photos?.[0]?.value
            });
          } else {
            // Create new user
            user = await storage.createUser({
              email: profile.emails?.[0]?.value || "",
              githubId: profile.id,
              firstName: profile.displayName?.split(" ")[0],
              lastName: profile.displayName?.split(" ").slice(1).join(" "),
              profileImageUrl: profile.photos?.[0]?.value,
              emailVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Auth middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.token;
    
    if (!token) {
      console.log("🔐 requireAuth: No token provided");
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("🔐 requireAuth: Invalid or expired JWT");
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user) {
      console.log("🔐 requireAuth: User not found for ID:", decoded.userId);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔐 requireAuth unexpected error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Email verification required middleware
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;
  if (!user.emailVerified) {
    return res.status(403).json({ message: "Email verification required" });
  }
  next();
};
