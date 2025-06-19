import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Experience, Profile, Education } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseTools } from "@/lib/utils";
import ExperienceModal from "@/components/experience-modal";
import ExperienceCard from "@/components/experience-card";
import SortableExperienceList from "@/components/sortable-experience-list";
import EducationModal from "@/components/education-modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProfileFormData {
  name: string;
  briefIntro: string;
  educationCategories: string[];
}

// Sortable item component for admin ordering
function AdminSortableItem({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-white border border-gray-200 p-4 mb-2">
      <div className="flex items-center gap-3">
        <button
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'education'>('profile');
  const [experienceSubTab, setExperienceSubTab] = useState<'list' | 'tools-order' | 'industries-order'>('list');
  const [toolsOrder, setToolsOrder] = useState<string[]>([]);
  const [industriesOrder, setIndustriesOrder] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Profile data and mutations
  const { data: profile, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    briefIntro: "",
    educationCategories: [],
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        briefIntro: profile.briefIntro || "",
        educationCategories: profile.educationCategories || [],
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const response = await apiRequest('PUT', '/api/admin/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      refetchProfile();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Experience data
  const { data: experiences = [], refetch: refetchExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/admin/experiences"],
  });

  const { data: education = [], refetch: refetchEducation } = useQuery<Education[]>({
    queryKey: ["/api/education"],
  });

  // Process tools and industries data
  const processedData = useMemo(() => {
    const toolsMap = new Map<string, { experiences: Experience[], usage: Map<string, string> }>();
    const industriesMap = new Map<string, Experience[]>();

    experiences.forEach(exp => {
      // Process tools
      const tools = parseTools(exp.tools || []);
      tools.forEach(tool => {
        if (!toolsMap.has(tool.name)) {
          toolsMap.set(tool.name, { experiences: [], usage: new Map() });
        }
        const toolData = toolsMap.get(tool.name)!;
        toolData.experiences.push(exp);
        toolData.usage.set(exp.id.toString(), tool.usage);
      });

      // Process industries
      if (!industriesMap.has(exp.industry)) {
        industriesMap.set(exp.industry, []);
      }
      industriesMap.get(exp.industry)!.push(exp);
    });

    return { toolsMap, industriesMap };
  }, [experiences]);

  // Initialize order arrays from profile data
  const getToolsList = () => {
    const toolsArray = Array.from(processedData.toolsMap.keys());
    if (toolsOrder.length === 0 && toolsArray.length > 0) {
      // Use saved order from profile, fallback to alphabetical
      const savedOrder = profile?.toolsOrder || [];
      const initialOrder = savedOrder.length > 0 
        ? [...savedOrder, ...toolsArray.filter(tool => !savedOrder.includes(tool))]
        : toolsArray.sort((a, b) => a.localeCompare(b));
      setToolsOrder(initialOrder);
      return initialOrder;
    }
    return toolsOrder.filter(tool => processedData.toolsMap.has(tool));
  };

  const getIndustriesList = () => {
    const industriesArray = Array.from(processedData.industriesMap.keys());
    if (industriesOrder.length === 0 && industriesArray.length > 0) {
      // Use saved order from profile, fallback to alphabetical
      const savedOrder = profile?.industriesOrder || [];
      const initialOrder = savedOrder.length > 0 
        ? [...savedOrder, ...industriesArray.filter(industry => !savedOrder.includes(industry))]
        : industriesArray.sort((a, b) => a.localeCompare(b));
      setIndustriesOrder(initialOrder);
      return initialOrder;
    }
    return industriesOrder.filter(industry => processedData.industriesMap.has(industry));
  };

  // Save ordering mutations
  const saveToolsOrderMutation = useMutation({
    mutationFn: async (toolsOrder: string[]) => {
      await apiRequest("/api/admin/tools-order", "PATCH", { toolsOrder });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tools order saved successfully",
      });
    },
    onError: (error) => {
      console.error("Tools order save error:", error);
      toast({
        title: "Error",
        description: `Failed to save tools order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const saveIndustriesOrderMutation = useMutation({
    mutationFn: async (industriesOrder: string[]) => {
      await apiRequest("/api/admin/industries-order", "PATCH", { industriesOrder });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industries order saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save industries order",
        variant: "destructive",
      });
    },
  });

  // Drag end handlers with auto-save
  const handleToolsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = toolsOrder.indexOf(active.id as string);
      const newIndex = toolsOrder.indexOf(over.id as string);
      const newOrder = arrayMove(toolsOrder, oldIndex, newIndex);
      setToolsOrder(newOrder);
      saveToolsOrderMutation.mutate(newOrder);
    }
  };

  const handleIndustriesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = industriesOrder.indexOf(active.id as string);
      const newIndex = industriesOrder.indexOf(over.id as string);
      const newOrder = arrayMove(industriesOrder, oldIndex, newIndex);
      setIndustriesOrder(newOrder);
      saveIndustriesOrderMutation.mutate(newOrder);
    }
  };

  // Update form when profile loads
  useState(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        briefIntro: profile.briefIntro,
        educationCategories: profile.educationCategories || [],
      });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowExperienceModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setShowExperienceModal(true);
  };

  const handleExperienceModalClose = () => {
    setShowExperienceModal(false);
    setEditingExperience(null);
  };

  const handleExperienceChange = () => {
    refetchExperiences();
    handleExperienceModalClose();
  };

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/experiences/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    },
  });

  const handleDeleteExperience = (id: number) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      deleteExperienceMutation.mutate(id);
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setEditingEducation(null);
    setShowEducationModal(true);
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setShowEducationModal(true);
  };

  const handleEducationModalClose = () => {
    setShowEducationModal(false);
    setEditingEducation(null);
  };

  const handleEducationChange = () => {
    refetchEducation();
    handleEducationModalClose();
  };

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/education/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEducation = (id: number) => {
    if (window.confirm("Are you sure you want to delete this education?")) {
      deleteEducationMutation.mutate(id);
    }
  };

  const addEducationCategory = () => {
    const newCategory = prompt("Enter new education category:");
    if (newCategory && !profileForm.educationCategories.includes(newCategory)) {
      setProfileForm({
        ...profileForm,
        educationCategories: [...profileForm.educationCategories, newCategory],
      });
    }
  };

  const removeEducationCategory = (index: number) => {
    setProfileForm({
      ...profileForm,
      educationCategories: profileForm.educationCategories.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-white font-apercu texture-overlay">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">ADMIN DASHBOARD</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => logout()}
                className="text-sollo-red hover:text-sollo-red/80 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'profile'
                ? 'bg-white border-sollo-red text-sollo-red'
                : 'bg-white border-gray-200 hover:border-sollo-red hover:text-sollo-red'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'experiences'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Experiences
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'education'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Education
          </button>
        </div>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-50 p-8">
            <h2 className="font-baron text-xl tracking-wide mb-6">PROFILE SETTINGS</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brief Introduction</label>
                <textarea
                  rows={4}
                  value={profileForm.briefIntro}
                  onChange={(e) => setProfileForm({ ...profileForm, briefIntro: e.target.value })}
                  className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                  placeholder="Write a brief introduction about yourself..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Education Categories</label>
                <div className="space-y-2 mb-4">
                  {profileForm.educationCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 border border-gray-200">
                      <span>{category}</span>
                      <button
                        type="button"
                        onClick={() => removeEducationCategory(index)}
                        className="text-sollo-red hover:text-sollo-red/80"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addEducationCategory}
                  className="text-sollo-gold hover:text-sollo-gold/80 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Category
                </button>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-sollo-red text-white px-8 py-3 font-medium hover:bg-sollo-red/90 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-baron text-xl tracking-wide">MANAGE EXPERIENCES</h2>
              <button
                onClick={handleAddExperience}
                className="bg-sollo-gold text-white px-6 py-3 font-medium hover:bg-sollo-gold/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Experience
              </button>
            </div>

            {/* Experience Management Sub-tabs */}
            <div className="mb-8">
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setExperienceSubTab('list')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    experienceSubTab === 'list'
                      ? 'border-sollo-gold text-sollo-gold'
                      : 'border-transparent text-gray-500 hover:text-sollo-gold'
                  }`}
                >
                  Experience List
                </button>
                <button
                  onClick={() => setExperienceSubTab('tools-order')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    experienceSubTab === 'tools-order'
                      ? 'border-sollo-gold text-sollo-gold'
                      : 'border-transparent text-gray-500 hover:text-sollo-gold'
                  }`}
                >
                  Tools Order
                </button>
                <button
                  onClick={() => setExperienceSubTab('industries-order')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    experienceSubTab === 'industries-order'
                      ? 'border-sollo-gold text-sollo-gold'
                      : 'border-transparent text-gray-500 hover:text-sollo-gold'
                  }`}
                >
                  Industries Order
                </button>
              </div>
            </div>

            {experienceSubTab === 'list' && (
              <SortableExperienceList
                experiences={experiences}
                onEditExperience={handleEditExperience}
                onDeleteExperience={handleDeleteExperience}
              />
            )}

            {experienceSubTab === 'tools-order' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Drag and drop to reorder how tools appear in the "By Tools" view on your portfolio.</p>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleToolsDragEnd}>
                  <SortableContext items={getToolsList()} strategy={verticalListSortingStrategy}>
                    {getToolsList().map((toolName) => {
                      const toolData = processedData.toolsMap.get(toolName);
                      if (!toolData) return null;
                      
                      return (
                        <AdminSortableItem key={toolName} id={toolName}>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-lg">{toolName}</h4>
                              <span className="text-sm text-gray-500">
                                {toolData.experiences.length} experience{toolData.experiences.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Used in: {toolData.experiences.map(exp => exp.company).join(', ')}
                            </div>
                          </div>
                        </AdminSortableItem>
                      );
                    })}
                  </SortableContext>
                </DndContext>
                
                {getToolsList().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No tools found. Add experiences with tools to manage their order.
                  </div>
                )}
              </div>
            )}

            {experienceSubTab === 'industries-order' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Drag and drop to reorder how industries appear in the "By Industries" view on your portfolio.</p>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIndustriesDragEnd}>
                  <SortableContext items={getIndustriesList()} strategy={verticalListSortingStrategy}>
                    {getIndustriesList().map((industryName) => {
                      const industryExperiences = processedData.industriesMap.get(industryName);
                      if (!industryExperiences) return null;
                      
                      return (
                        <AdminSortableItem key={industryName} id={industryName}>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-lg">{industryName}</h4>
                              <span className="text-sm text-gray-500">
                                {industryExperiences.length} experience{industryExperiences.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Companies: {industryExperiences.map(exp => exp.company).join(', ')}
                            </div>
                          </div>
                        </AdminSortableItem>
                      );
                    })}
                  </SortableContext>
                </DndContext>
                
                {getIndustriesList().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No industries found. Add experiences to manage their order.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-baron text-xl tracking-wide">MANAGE EDUCATION</h2>
              <button
                onClick={handleAddEducation}
                className="bg-sollo-gold text-white px-6 py-3 font-medium hover:bg-sollo-gold/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Education
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(
                education.reduce((acc, edu) => {
                  if (!acc[edu.category]) {
                    acc[edu.category] = [];
                  }
                  acc[edu.category].push(edu);
                  return acc;
                }, {} as Record<string, Education[]>)
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                <div key={category} className="p-6 border-l-4 border-sollo-gold">
                  <h3 className="font-baron text-xl tracking-wide mb-4">{category.toUpperCase()}</h3>
                  <div className="space-y-4">
                    {items
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .map((item) => (
                      <div key={item.id} className="bg-gray-50 p-4 group hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-sm text-sollo-red hover:text-sollo-red/80 flex items-center gap-1"
                              >
                                {item.name}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                            )}
                            {item.date && (
                              <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditEducation(item)}
                              className="text-sollo-gold hover:text-sollo-gold/80 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEducation(item.id)}
                              className="text-sollo-red hover:text-sollo-red/80 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <div className="text-center py-16 col-span-2 border-2 border-dashed border-gray-200">
                  <p className="text-gray-600 text-lg">No education added yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Education" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <ExperienceModal
          experience={editingExperience}
          onClose={handleExperienceModalClose}
          onSave={handleExperienceChange}
        />
      )}

      {/* Education Modal */}
      {showEducationModal && (
        <EducationModal
          education={editingEducation}
          onClose={handleEducationModalClose}
          onSave={handleEducationChange}
        />
      )}
    </div>
  );
}