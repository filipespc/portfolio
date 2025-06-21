import { experiences, adminUsers, profile, education, caseStudies, type Experience, type InsertExperience, type AdminUser, type InsertAdminUser, type Profile, type InsertProfile, type Education, type InsertEducation, type CaseStudy, type InsertCaseStudy } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Admin user methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  
  // Profile methods
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profileData: Partial<InsertProfile>): Promise<Profile>;
  
  // Experience methods
  getAllExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Education methods
  getAllEducation(): Promise<Education[]>;
  getEducation(id: number): Promise<Education | undefined>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<InsertEducation>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;
  reorderEducation(educationIds: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = Date.now().toString(); // Simple ID generation
    const [user] = await db
      .insert(adminUsers)
      .values({ ...insertUser, id })
      .returning();
    return user;
  }

  // Profile methods
  async getProfile(): Promise<Profile | undefined> {
    const [profileData] = await db.select().from(profile).limit(1);
    if (!profileData) {
      // Create default profile if none exists
      const [newProfile] = await db
        .insert(profile)
        .values({})
        .returning();
      return newProfile;
    }
    return profileData;
  }

  async updateProfile(profileData: Partial<InsertProfile>): Promise<Profile> {
    const existingProfile = await this.getProfile();
    if (existingProfile) {
      const [updated] = await db
        .update(profile)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(profile.id, existingProfile.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(profile)
        .values(profileData)
        .returning();
      return created;
    }
  }

  // Experience methods
  async getAllExperiences(): Promise<Experience[]> {
    const experienceList = await db.select().from(experiences);
    return experienceList.sort((a, b) => {
      // Sort by start date descending (most recent first)
      return b.startDate.localeCompare(a.startDate);
    });
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.id, id));
    return experience || undefined;
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const [experience] = await db
      .insert(experiences)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async updateExperience(id: number, updateData: Partial<InsertExperience>): Promise<Experience | undefined> {
    const [updated] = await db
      .update(experiences)
      .set(updateData)
      .where(eq(experiences.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteExperience(id: number): Promise<boolean> {
    const result = await db.delete(experiences).where(eq(experiences.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Education methods
  async getAllEducation(): Promise<Education[]> {
    const educationList = await db.select().from(education).orderBy(education.category, education.sortOrder);
    return educationList;
  }

  async getEducation(id: number): Promise<Education | undefined> {
    const [educationItem] = await db.select().from(education).where(eq(education.id, id));
    return educationItem || undefined;
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const [educationItem] = await db
      .insert(education)
      .values(insertEducation)
      .returning();
    return educationItem;
  }

  async updateEducation(id: number, updateData: Partial<InsertEducation>): Promise<Education | undefined> {
    const [updated] = await db
      .update(education)
      .set(updateData)
      .where(eq(education.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEducation(id: number): Promise<boolean> {
    const result = await db.delete(education).where(eq(education.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async reorderEducation(educationIds: number[]): Promise<void> {
    // Update sort order for each education item
    for (let i = 0; i < educationIds.length; i++) {
      await db
        .update(education)
        .set({ sortOrder: i })
        .where(eq(education.id, educationIds[i]));
    }
  }
}

export const storage = new DatabaseStorage();
