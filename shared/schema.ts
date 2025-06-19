import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  industry: text("industry").notNull(),
  startDate: text("start_date").notNull(), // Format: YYYY-MM
  endDate: text("end_date"), // Format: YYYY-MM, null if current
  isCurrentJob: boolean("is_current_job").default(false),
  description: text("description").notNull(),
  accomplishments: text("accomplishments").notNull(),
  tools: text("tools").array().default([]), // JSON array of tool objects {name: string, usage: string}
  education: text("education").array().default([]), // JSON array of education objects {name: string, category: string}
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

// Keep existing user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
