import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Session storage table for express-session
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => ({
    expireIndex: index('IDX_session_expire').on(table.expire),
  })
);

// Users table
export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    email: varchar('email').unique().notNull(),
    password: varchar('password'), // nullable for social auth only users
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    profileImageUrl: varchar('profile_image_url'),
    emailVerified: boolean('email_verified').default(false),
    emailVerificationToken: varchar('email_verification_token').unique(),
    passwordResetToken: varchar('password_reset_token').unique(),
    passwordResetExpires: timestamp('password_reset_expires'),
    googleId: varchar('google_id').unique(), // .index() not chained
    githubId: varchar('github_id').unique(), // .index() not chained
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    // Define indexes separately
    idx_users_email: index('idx_users_email').on(table.email),
    idx_users_google_id: index('idx_users_google_id').on(table.googleId),
    idx_users_github_id: index('idx_users_github_id').on(table.githubId),
    idx_users_email_verification_token: index('idx_users_email_verification_token').on(table.emailVerificationToken),
    idx_users_password_reset_token: index('idx_users_password_reset_token').on(table.passwordResetToken),
  })
);

// User sessions for tracking active sessions
export const userSessions = pgTable(
  'user_sessions',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    idx_user_sessions_user_id: index('idx_user_sessions_user_id').on(table.userId),
    idx_user_sessions_expires_at: index('idx_user_sessions_expires_at').on(table.expiresAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const registerUserSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;