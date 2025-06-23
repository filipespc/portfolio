import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExperienceSchema, insertProfileSchema, insertAdminUserSchema, insertEducationSchema, insertCaseStudySchema } from "@shared/schema";
import { z } from "zod";
import { getSession, requireAuth, hashPassword, verifyPassword } from "./auth";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(getSession());

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure multer for memory storage (for Cloudinary upload)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for Cloudinary
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Image upload endpoint with Cloudinary and resizing
  app.post('/api/upload-image', requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No file uploaded' });
      }

      // Get resize parameters from request
      const width = parseInt(req.body.width) || 800;
      const height = parseInt(req.body.height) || 600;
      const maintainAspectRatio = req.body.maintainAspectRatio === 'true';
      const imageType = req.body.imageType || 'content'; // 'featured' or 'content'
      
      console.log('Upload parameters:', { width, height, maintainAspectRatio, imageType });

      // Configure transformation based on parameters
      let cropMode = 'limit';
      if (!maintainAspectRatio) {
        cropMode = 'fill'; // Will crop to exact dimensions
      }

      const transformation = [
        { width: width, height: height, crop: cropMode },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];

      // Add different optimization for different image types
      if (imageType === 'featured') {
        transformation.push({ dpr: 'auto' } as any); // Device pixel ratio optimization
      }

      // Upload to Cloudinary using buffer
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `portfolio-case-studies/${imageType}`,
            transformation: transformation
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      const cloudinaryResult = result as any;
      
      res.json({
        success: 1,
        file: {
          url: cloudinaryResult.secure_url,
        }
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ success: 0, message: 'Upload failed' });
    }
  });

  // Auth routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const adminUser = await storage.getAdminUserByUsername(username);
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, adminUser.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).adminId = adminUser.id;
      res.json({ message: "Login successful", user: { id: adminUser.id, username: adminUser.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/admin/me", requireAuth, async (req, res) => {
    try {
      const adminId = (req.session as any).adminId;
      const adminUser = await storage.getAdminUser(adminId);
      if (!adminUser) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ id: adminUser.id, username: adminUser.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create initial admin user (for setup)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Check if admin already exists
      const existingAdmin = await storage.getAdminUserByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin user already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const adminUser = await storage.createAdminUser({ username, password: hashedPassword });
      
      res.json({ message: "Admin user created successfully", user: { id: adminUser.id, username: adminUser.username } });
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const profileData = await storage.getProfile();
      res.json(profileData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/admin/profile", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateProfile(validatedData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Save tools ordering
  app.patch("/api/admin/tools-order", requireAuth, async (req, res) => {
    try {
      const { toolsOrder } = req.body;
      if (!Array.isArray(toolsOrder)) {
        return res.status(400).json({ error: "toolsOrder must be an array" });
      }
      
      const updatedProfile = await storage.updateProfile({ toolsOrder });
      res.json({ success: true, toolsOrder: updatedProfile.toolsOrder });
    } catch (error) {
      console.error("Error updating tools order:", error);
      res.status(500).json({ error: "Failed to update tools order" });
    }
  });

  // Save industries ordering
  app.patch("/api/admin/industries-order", requireAuth, async (req, res) => {
    try {
      const { industriesOrder } = req.body;
      if (!Array.isArray(industriesOrder)) {
        return res.status(400).json({ error: "industriesOrder must be an array" });
      }
      
      const updatedProfile = await storage.updateProfile({ industriesOrder });
      res.json({ success: true, industriesOrder: updatedProfile.industriesOrder });
    } catch (error) {
      console.error("Error updating industries order:", error);
      res.status(500).json({ error: "Failed to update industries order" });
    }
  });

  // Public experience routes
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  // Admin-only experience routes
  app.get("/api/admin/experiences/:id", requireAuth, async (req, res) => {
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

  app.post("/api/admin/experiences", requireAuth, async (req, res) => {
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

  app.put("/api/admin/experiences/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/admin/experiences/:id", requireAuth, async (req, res) => {
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

  // Education routes
  app.get("/api/education", async (req, res) => {
    try {
      const educationList = await storage.getAllEducation();
      res.json(educationList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch education" });
    }
  });

  app.post("/api/admin/education", requireAuth, async (req, res) => {
    try {
      const validatedData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(validatedData);
      res.status(201).json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create education" });
    }
  });

  app.put("/api/admin/education/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid education ID" });
      }
      
      const validatedData = insertEducationSchema.partial().parse(req.body);
      const education = await storage.updateEducation(id, validatedData);
      
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      res.json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update education" });
    }
  });

  app.delete("/api/admin/education/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid education ID" });
      }
      
      const deleted = await storage.deleteEducation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete education" });
    }
  });

  app.put("/api/admin/education/reorder", requireAuth, async (req, res) => {
    try {
      const { educationIds } = req.body;
      
      if (!Array.isArray(educationIds) || educationIds.some(id => typeof id !== 'number')) {
        return res.status(400).json({ message: "Invalid education IDs array" });
      }
      
      await storage.reorderEducation(educationIds);
      res.json({ message: "Education reordered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder education" });
    }
  });

  // Case Studies routes
  app.get("/api/case-studies", async (req, res) => {
    try {
      const caseStudies = await storage.getPublishedCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.get("/api/case-studies/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const caseStudy = await storage.getCaseStudyBySlug(slug);
      
      if (!caseStudy || !caseStudy.isPublished) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      res.json(caseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ message: "Failed to fetch case study" });
    }
  });

  // Admin Case Studies routes
  app.get("/api/admin/case-studies", requireAuth, async (req, res) => {
    try {
      const caseStudies = await storage.getAllCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.post("/api/admin/case-studies", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCaseStudySchema.parse(req.body);
      const caseStudy = await storage.createCaseStudy(validatedData);
      res.status(201).json(caseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create case study" });
    }
  });

  app.put("/api/admin/case-studies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      
      const validatedData = insertCaseStudySchema.partial().parse(req.body);
      const caseStudy = await storage.updateCaseStudy(id, validatedData);
      
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      res.json(caseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update case study" });
    }
  });

  app.delete("/api/admin/case-studies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      
      const deleted = await storage.deleteCaseStudy(id);
      if (!deleted) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete case study" });
    }
  });

  app.get("/api/admin/experiences", requireAuth, async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
