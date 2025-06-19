import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Experience, InsertExperience, Profile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseTools, parseEducation, stringifyTools, stringifyEducation } from "@/lib/utils";

interface ExperienceModalProps {
  experience?: Experience | null;
  onClose: () => void;
  onSave: () => void;
}

interface ToolEntry {
  name: string;
  usage: string;
}

interface EducationEntry {
  name: string;
  category: string;
}

export default function ExperienceModal({ experience, onClose, onSave }: ExperienceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!experience;

  // Get education categories from profile
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const educationCategories = profile?.educationCategories || [
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
  ];

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    industry: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    description: '',
    accomplishments: '',
  });

  const [tools, setTools] = useState<ToolEntry[]>([{ name: '', usage: '' }]);
  const [education, setEducation] = useState<EducationEntry[]>([{ name: '', category: '' }]);

  useEffect(() => {
    if (experience) {
      setFormData({
        jobTitle: experience.jobTitle,
        industry: experience.industry,
        startDate: experience.startDate,
        endDate: experience.endDate || '',
        isCurrentJob: experience.isCurrentJob || false,
        description: experience.description,
        accomplishments: experience.accomplishments,
      });

      const parsedTools = parseTools(experience.tools || []);
      setTools(parsedTools.length > 0 ? parsedTools : [{ name: '', usage: '' }]);

      const parsedEducation = parseEducation(experience.education || []);
      setEducation(parsedEducation.length > 0 ? parsedEducation : [{ name: '', category: '' }]);
    }
  }, [experience]);

  const mutation = useMutation({
    mutationFn: async (data: InsertExperience) => {
      const url = isEditing ? `/api/admin/experiences/${experience.id}` : '/api/admin/experiences';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      toast({
        title: "Success",
        description: `Experience ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSave();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} experience`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle.trim() || !formData.industry.trim() || !formData.accomplishments.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const filteredTools = tools.filter(tool => tool.name.trim());
    const filteredEducation = education.filter(edu => edu.name.trim() && edu.category);

    const data: InsertExperience = {
      ...formData,
      endDate: formData.isCurrentJob ? null : formData.endDate || null,
      tools: stringifyTools(filteredTools),
      education: stringifyEducation(filteredEducation),
    };

    mutation.mutate(data);
  };

  const addTool = () => {
    setTools([...tools, { name: '', usage: '' }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: keyof ToolEntry, value: string) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], [field]: value };
    setTools(updated);
  };

  const addEducation = () => {
    setEducation([...education, { name: '', category: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-baron text-2xl tracking-wide">
            {isEditing ? 'EDIT EXPERIENCE' : 'ADD EXPERIENCE'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry *</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="month"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="month"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                disabled={formData.isCurrentJob}
                className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none disabled:bg-gray-100"
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={formData.isCurrentJob}
                  onChange={(e) => setFormData({...formData, isCurrentJob: e.target.checked, endDate: e.target.checked ? '' : formData.endDate})}
                  className="mr-2"
                />
                Currently working here
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
              placeholder="Describe your role and responsibilities..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Key Accomplishments *</label>
            <textarea
              rows={4}
              value={formData.accomplishments}
              onChange={(e) => setFormData({...formData, accomplishments: e.target.value})}
              className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
              placeholder="Describe your main achievements and impact..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tools Used</label>
            <div className="space-y-3">
              {tools.map((tool, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Tool name"
                    value={tool.name}
                    onChange={(e) => updateTool(index, 'name', e.target.value)}
                    className="p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="How it was used"
                      value={tool.usage}
                      onChange={(e) => updateTool(index, 'usage', e.target.value)}
                      className="flex-1 p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
                    />
                    {tools.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTool(index)}
                        className="text-sollo-red hover:text-sollo-red/80 px-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTool}
              className="mt-2 text-sollo-gold hover:text-sollo-gold/80 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Tool
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Education Acquired</label>
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Education/Course name"
                    value={edu.name}
                    onChange={(e) => updateEducation(index, 'name', e.target.value)}
                    className="p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={edu.category}
                      onChange={(e) => updateEducation(index, 'category', e.target.value)}
                      className="flex-1 p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                    >
                      <option value="">Select category</option>
                      {educationCategories.map((category: string) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-sollo-red hover:text-sollo-red/80 px-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="mt-2 text-sollo-red hover:text-sollo-red/80 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Education
            </button>
          </div>
          
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-sollo-red text-white px-8 py-3 font-medium hover:bg-sollo-red/90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save Experience'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-200 px-8 py-3 font-medium hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
