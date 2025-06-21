import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaseStudy, InsertCaseStudy } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

// Import Editor.js
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import ImageTool from '@editorjs/image';

interface CaseStudyModalProps {
  caseStudy?: CaseStudy | null;
  onClose: () => void;
  onSave: () => void;
}

export default function CaseStudyModal({ caseStudy, onClose, onSave }: CaseStudyModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize Editor.js
  useEffect(() => {
    if (!editorContainerRef.current || editorRef.current) return;

    const editor = new EditorJS({
      holder: editorContainerRef.current,
      tools: {
        header: {
          class: Header as any,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2
          }
        },
        list: List as any,
        paragraph: Paragraph as any,
        quote: Quote as any,
        code: Code as any,
        delimiter: Delimiter as any,
        inlineCode: InlineCode as any,
        marker: Marker as any,
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: '/api/upload-image',
            },
            field: 'image',
            types: 'image/*',
          }
        },
      },
      data: caseStudy ? JSON.parse(caseStudy.content) : undefined,
      placeholder: 'Write your case study content here...',
      onReady: () => {
        setIsEditorReady(true);
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [caseStudy]);

  // Set form values when editing
  useEffect(() => {
    if (caseStudy) {
      setTitle(caseStudy.title);
      setSlug(caseStudy.slug);
      setDescription(caseStudy.description);
      setFeaturedImage(caseStudy.featuredImage || "");
      setTags(caseStudy.tags ? caseStudy.tags.join(", ") : "");
      setIsPublished(caseStudy.isPublished);
      setIsFeatured(caseStudy.isFeatured);
    }
  }, [caseStudy]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!caseStudy) { // Only auto-generate slug for new case studies
      setSlug(generateSlug(value));
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        setFeaturedImage(result.file.url);
        setFeaturedImageFile(null);
        toast({
          title: "Success",
          description: "Featured image uploaded successfully",
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Featured image upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload featured image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFeaturedImageFile(file);
        handleFeaturedImageUpload(file);
      } else {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertCaseStudy) => {
      return await apiRequest("/api/admin/case-studies", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Case study created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      onSave();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating case study",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCaseStudy) => {
      return await apiRequest(`/api/admin/case-studies/${caseStudy!.id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({ title: "Case study updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      onSave();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating case study",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editorRef.current || !isEditorReady) {
      toast({
        title: "Editor not ready",
        description: "Please wait for the editor to load",
        variant: "destructive",
      });
      return;
    }

    try {
      const editorData = await editorRef.current.save();
      
      const data: InsertCaseStudy = {
        title,
        slug,
        description,
        content: JSON.stringify(editorData),
        featuredImage: featuredImage || null,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublished,
        isFeatured,
      };

      if (caseStudy) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      toast({
        title: "Error saving content",
        description: "Failed to save editor content",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {caseStudy ? "Edit Case Study" : "Create New Case Study"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Case study title"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for the case study card"
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Featured Image</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="featured-image-upload"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="featured-image-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
                <span className="text-gray-500">or</span>
                <div className="flex-1">
                  <Input
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
              {featuredImage && (
                <div className="mt-3">
                  <img
                    src={featuredImage}
                    alt="Featured image preview"
                    className="w-32 h-24 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="machine learning, data science, python"
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div>
            <Label>Content *</Label>
            <div className="border border-gray-200 rounded-lg p-4 min-h-[400px]">
              <div ref={editorContainerRef} />
            </div>
            {!isEditorReady && (
              <p className="text-sm text-gray-500 mt-2">Loading editor...</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending || !isEditorReady}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : caseStudy ? "Update Case Study" : "Create Case Study"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}