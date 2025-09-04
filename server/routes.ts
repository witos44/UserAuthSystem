import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { storage } from "./storage";
import { 
  configurePassport, 
  hashPassword, 
  generateToken, 
  requireAuth,
  generateRandomToken,
  comparePassword
} from "./auth";
import { 
  registerUserSchema,
  loginUserSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
} from "@shared/schema";
import type { User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Passport configuration
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Clean expired sessions periodically
  setInterval(() => {
    storage.cleanExpiredSessions();
  }, 60 * 60 * 1000); // Every hour

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Generate email verification token
      const verificationToken = generateRandomToken();

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        emailVerificationToken: verificationToken,
        emailVerified: false,
      });

      // TODO: Send verification email
      // sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({ 
        message: "User created successfully. Please check your email for verification.",
        userId: user.id 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      // Log full error
      console.error("Unexpected registration error:", error);
      console.error("Error stack:", error.stack);
      // Send minimal info to client
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await comparePassword(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Create session
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ 
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          emailVerified: user.emailVerified,
        }
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.token;
      if (token) {
        await storage.deleteSession(token);
      }
      res.clearCookie("token");
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified,
      hasPassword: !!user.password,
      hasGoogleAuth: !!user.googleId,
      hasGithubAuth: !!user.githubId,
    });
  });

  app.post("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.verifyEmail(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/resend-verification", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      const verificationToken = generateRandomToken();
      await storage.setEmailVerificationToken(user.id, verificationToken);

      // TODO: Send verification email
      // sendVerificationEmail(user.email, verificationToken);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if user exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      const resetToken = generateRandomToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setPasswordResetToken(user.id, resetToken, expires);

      // TODO: Send password reset email
      // sendPasswordResetEmail(user.email, resetToken);

      res.json({ message: "If the email exists, a reset link has been sent" });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.resetPassword(token, hashedPassword);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const validatedData = updateProfileSchema.parse(req.body);

      // Check if email is being changed and if it's already taken
      if (validatedData.email && validatedData.email !== user.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
          return res.status(400).json({ message: "Email is already taken" });
        }
      }

      const updatedUser = await storage.updateUser(user.id, validatedData);

      res.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileImageUrl: updatedUser.profileImageUrl,
          emailVerified: updatedUser.emailVerified,
        }
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const validatedData = changePasswordSchema.parse(req.body);

      if (!user.password) {
        return res.status(400).json({ message: "Cannot change password for social auth only accounts" });
      }

      const isCurrentPasswordValid = await comparePassword(validatedData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await hashPassword(validatedData.newPassword);
      await storage.updateUser(user.id, { password: hashedNewPassword });

      // Invalidate all user sessions except current one
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.token;
      await storage.deleteUserSessions(user.id);
      
      // Recreate current session
      if (token) {
        await storage.createSession({
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Social auth routes
  app.get("/api/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"] 
  }));

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login?error=social-auth-failed" }),
    async (req, res) => {
      const user = req.user as User;
      const token = generateToken(user.id);

      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    }
  );

  app.get("/api/auth/github", passport.authenticate("github", { 
    scope: ["user:email"] 
  }));

  app.get("/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login?error=social-auth-failed" }),
    async (req, res) => {
      const user = req.user as User;
      const token = generateToken(user.id);

      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
      emailVerified: boolean;
      password?: string;
      googleId?: string;
      githubId?: string;
    }
  }
}
