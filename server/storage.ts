import { experiences, users, type Experience, type InsertExperience, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Experience methods
  getAllExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private experiences: Map<number, Experience>;
  private currentUserId: number;
  private currentExperienceId: number;

  constructor() {
    this.users = new Map();
    this.experiences = new Map();
    this.currentUserId = 1;
    this.currentExperienceId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Experience methods
  async getAllExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values()).sort((a, b) => {
      // Sort by start date descending (most recent first)
      return b.startDate.localeCompare(a.startDate);
    });
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = this.currentExperienceId++;
    const experience: Experience = { ...insertExperience, id };
    this.experiences.set(id, experience);
    return experience;
  }

  async updateExperience(id: number, updateData: Partial<InsertExperience>): Promise<Experience | undefined> {
    const existing = this.experiences.get(id);
    if (!existing) return undefined;
    
    const updated: Experience = { ...existing, ...updateData };
    this.experiences.set(id, updated);
    return updated;
  }

  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }
}

export const storage = new MemStorage();
