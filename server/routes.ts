import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExperienceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Experience routes
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  app.get("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid experience ID" });
      }
      
      const experience = await storage.getExperience(id);
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experience" });
    }
  });

  app.post("/api/experiences", async (req, res) => {
    try {
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create experience" });
    }
  });

  app.put("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid experience ID" });
      }
      
      const validatedData = insertExperienceSchema.partial().parse(req.body);
      const experience = await storage.updateExperience(id, validatedData);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update experience" });
    }
  });

  app.delete("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid experience ID" });
      }
      
      const deleted = await storage.deleteExperience(id);
      if (!deleted) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete experience" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
