import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin user table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile settings table
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Your Name"),
  briefIntro: text("brief_intro").notNull().default("Professional with extensive experience in building scalable digital products and leading cross-functional teams across various industries. Passionate about creating innovative solutions that drive business growth."),
  educationCategories: text("education_categories").array().default([
    'Product Management',
    'Data Analytics', 
    'Machine Learning',
    'AI',
    'Software Development',
    'Business Strategy',
    'UX/UI Design',
    'Marketing',
    'Finance',
    'Other'
  ]),
  toolsOrder: text("tools_order").array().default([]),
  industriesOrder: text("industries_order").array().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  startDate: text("start_date").notNull(), // Format: YYYY-MM
  endDate: text("end_date"), // Format: YYYY-MM, null if current
  isCurrentJob: boolean("is_current_job").default(false).notNull(),
  description: text("description").notNull(),
  accomplishments: text("accomplishments").notNull(),
  tools: text("tools").array().default([]), // JSON array of tool objects {name: string, usage: string}
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  link: text("link"),
  date: text("date"), // Format: YYYY-MM or descriptive text
  sortOrder: integer("sort_order").default(0), // For manual ordering within categories
});

export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Editor.js JSON content
  featuredImage: text("featured_image"), // URL or path to featured image
  tags: text("tags").array().default([]),
  isPublished: boolean("is_published").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema definitions
export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

export const insertProfileSchema = createInsertSchema(profile).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
