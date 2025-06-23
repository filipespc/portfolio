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
import LinkTool from '@editorjs/link';
import { SimpleLinkTool } from './simple-link-tool';


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
  const [featuredImageWidth, setFeaturedImageWidth] = useState<number>(800);
  const [featuredImageHeight, setFeaturedImageHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  
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
        link: SimpleLinkTool as any,
        linkTool: {
          class: LinkTool as any,
          config: {
            endpoint: '/api/fetch-url',
          },
          shortcut: 'CMD+K'
        },
        image: {
          class: ImageTool as any,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                // Show resize dialog before upload
                return new Promise((resolve, reject) => {
                  const showResizeDialog = () => {
                    const dialogHtml = `
                      <div id="image-resize-modal" style="
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.5); display: flex; align-items: center;
                        justify-content: center; z-index: 10000;
                      ">
                        <div style="
                          background: white; padding: 24px; border-radius: 8px;
                          max-width: 450px; width: 90%; max-height: 80vh; overflow-y: auto;
                        ">
                          <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">Resize Image</h3>
                          
                          <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Quick Presets</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                              <button data-size="400,300" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Small (400×300)</button>
                              <button data-size="800,600" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Medium (800×600)</button>
                              <button data-size="1200,900" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Large (1200×900)</button>
                              <button data-size="1200,400" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Banner (1200×400)</button>
                              <button data-size="600,600" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Square (600×600)</button>
                            </div>
                          </div>

                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                            <div>
                              <label style="display: block; margin-bottom: 4px; font-size: 14px;">Width (px)</label>
                              <input id="img-width" type="number" value="800" min="100" max="2000" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                              <label style="display: block; margin-bottom: 4px; font-size: 14px;">Height (px)</label>
                              <input id="img-height" type="number" value="600" min="100" max="2000" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                          </div>

                          <div style="margin-bottom: 16px;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                              <input id="img-aspect" type="checkbox" checked>
                              Maintain aspect ratio
                            </label>
                            <p id="img-desc" style="margin: 8px 0 0; font-size: 12px; color: #666;">Image will be resized proportionally</p>
                          </div>

                          <div style="display: flex; justify-content: flex-end; gap: 12px;">
                            <button id="img-cancel" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Cancel</button>
                            <button id="img-upload" style="padding: 8px 16px; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer;">Upload</button>
                          </div>
                        </div>
                      </div>
                    `;

                    document.body.insertAdjacentHTML('beforeend', dialogHtml);

                    const modal = document.getElementById('image-resize-modal')!;
                    const widthInput = document.getElementById('img-width') as HTMLInputElement;
                    const heightInput = document.getElementById('img-height') as HTMLInputElement;
                    const aspectCheck = document.getElementById('img-aspect') as HTMLInputElement;
                    const desc = document.getElementById('img-desc')!;

                    // Preset buttons
                    modal.querySelectorAll('[data-size]').forEach(btn => {
                      btn.addEventListener('click', () => {
                        const [w, h] = (btn as HTMLElement).dataset.size!.split(',');
                        widthInput.value = w;
                        heightInput.value = h;
                      });
                    });

                    // Aspect ratio handling
                    aspectCheck.addEventListener('change', () => {
                      desc.textContent = aspectCheck.checked 
                        ? 'Image will be resized proportionally'
                        : 'Image will be cropped to exact dimensions';
                    });

                    widthInput.addEventListener('input', () => {
                      if (aspectCheck.checked) {
                        heightInput.value = Math.round(parseInt(widthInput.value) * 0.75).toString();
                      }
                    });

                    heightInput.addEventListener('input', () => {
                      if (aspectCheck.checked) {
                        widthInput.value = Math.round(parseInt(heightInput.value) * 1.33).toString();
                      }
                    });

                    document.getElementById('img-cancel')!.addEventListener('click', () => {
                      modal.remove();
                      reject(new Error('Upload cancelled'));
                    });

                    document.getElementById('img-upload')!.addEventListener('click', async () => {
                      const width = parseInt(widthInput.value) || 800;
                      const height = parseInt(heightInput.value) || 600;
                      const maintainAspectRatio = aspectCheck.checked;
                      
                      modal.remove();

                      try {
                        const formData = new FormData();
                        formData.append('image', file);
                        formData.append('imageType', 'content');
                        formData.append('width', width.toString());
                        formData.append('height', height.toString());
                        formData.append('maintainAspectRatio', maintainAspectRatio.toString());
                        
                        const response = await fetch('/api/upload-image', {
                          method: 'POST',
                          body: formData,
                          credentials: 'include',
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Upload failed: ${response.status}`);
                        }
                        
                        const result = await response.json();
                        if (result.success) {
                          resolve({
                            success: 1,
                            file: { url: result.file.url }
                          });
                        } else {
                          throw new Error(result.message || 'Upload failed');
                        }
                      } catch (error) {
                        reject(error);
                      }
                    });
                  };

                  showResizeDialog();
                });
              }
            }
          }
        },
      },
      data: caseStudy ? JSON.parse(caseStudy.content) : undefined,
      placeholder: 'Write your case study content here...',
      inlineToolbar: ['marker', 'inlineCode', 'link'],
      minHeight: 300,
      onReady: () => {
        setIsEditorReady(true);
        console.log('Editor ready with inline toolbar including link tool');
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
      formData.append('width', featuredImageWidth.toString());
      formData.append('height', featuredImageHeight.toString());
      formData.append('maintainAspectRatio', maintainAspectRatio.toString());
      formData.append('imageType', 'featured');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include session cookies for authentication
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Featured image upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Featured image upload result:', result);
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
        description: `Failed to upload featured image: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium mb-3 block">Image Resize Options</Label>
                
                {/* Preset sizes */}
                <div className="mb-4">
                  <Label className="text-xs mb-2 block">Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Small', w: 400, h: 300 },
                      { label: 'Medium', w: 800, h: 600 },
                      { label: 'Large', w: 1200, h: 900 },
                      { label: 'Banner', w: 1200, h: 400 },
                      { label: 'Square', w: 600, h: 600 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFeaturedImageWidth(preset.w);
                          setFeaturedImageHeight(preset.h);
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        {preset.label} ({preset.w}×{preset.h})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom dimensions */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor="imageWidth" className="text-xs">Width (px)</Label>
                    <Input
                      id="imageWidth"
                      type="number"
                      value={featuredImageWidth}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 800;
                        setFeaturedImageWidth(width);
                        if (maintainAspectRatio) {
                          setFeaturedImageHeight(Math.round(width * 0.75));
                        }
                      }}
                      min="100"
                      max="2000"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageHeight" className="text-xs">Height (px)</Label>
                    <Input
                      id="imageHeight"
                      type="number"
                      value={featuredImageHeight}
                      onChange={(e) => {
                        const height = parseInt(e.target.value) || 600;
                        setFeaturedImageHeight(height);
                        if (maintainAspectRatio) {
                          setFeaturedImageWidth(Math.round(height * 1.33));
                        }
                      }}
                      min="100"
                      max="2000"
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="text-xs"
                  />
                  <Label htmlFor="aspectRatio" className="text-xs">Maintain aspect ratio</Label>
                </div>
                
                <p className="text-xs text-gray-500">
                  {maintainAspectRatio 
                    ? 'Image will be resized proportionally to fit within dimensions' 
                    : 'Image will be cropped to exact dimensions'
                  }
                </p>
              </div>
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
            <div className="flex items-center justify-between mb-2">
              <Label>Content *</Label>
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <strong>Creating links:</strong> Select any text to see the inline toolbar with 🔗 link icon, or press Cmd+L to convert selected text to clickable links.
              </div>
            </div>
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