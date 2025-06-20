import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Experience, InsertExperience } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseTools, stringifyTools } from "@/lib/utils";

interface ExperienceModalProps {
  experience?: Experience | null;
  onClose: () => void;
  onSave: () => void;
}

interface ToolEntry {
  name: string;
  usage: string;
}

export default function ExperienceModal({ experience, onClose, onSave }: ExperienceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!experience;

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

  useEffect(() => {
    if (experience) {
      setFormData({
        jobTitle: experience.jobTitle,
        company: experience.company,
        industry: experience.industry,
        startDate: experience.startDate,
        endDate: experience.endDate || '',
        isCurrentJob: experience.isCurrentJob || false,
        description: experience.description,
        accomplishments: experience.accomplishments,
      });

      const parsedTools = parseTools(experience.tools || []);
      setTools(parsedTools.length > 0 ? parsedTools : [{ name: '', usage: '' }]);
    }
  }, [experience]);

  const mutation = useMutation({
    mutationFn: async (data: InsertExperience) => {
      const url = isEditing ? `/api/admin/experiences/${experience.id}` : '/api/admin/experiences';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await apiRequest(url, method, data);
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
    onError: (error) => {
      console.error("Experience save error:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} experience: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.company || !formData.industry || !formData.startDate || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const filteredTools = tools.filter(tool => tool.name.trim());

    const data: InsertExperience = {
      ...formData,
      endDate: formData.isCurrentJob ? null : formData.endDate || null,
      tools: stringifyTools(filteredTools),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-baron text-2xl tracking-wide">
            {isEditing ? "EDIT EXPERIENCE" : "ADD EXPERIENCE"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                placeholder="e.g., Senior Product Manager"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                placeholder="e.g., Tech Solutions Inc."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry *</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
              placeholder="e.g., Technology, Healthcare, Finance"
              required
            />
          </div>

          {/* Date Information */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="month"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="month"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                disabled={formData.isCurrentJob}
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCurrentJob}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isCurrentJob: e.target.checked,
                    endDate: e.target.checked ? '' : formData.endDate
                  })}
                  className="w-4 h-4 text-sollo-red"
                />
                <span className="text-sm">Current Position</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Job Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
              placeholder="Describe your role and responsibilities..."
              required
            />
          </div>

          {/* Accomplishments */}
          <div>
            <label className="block text-sm font-medium mb-2">Key Accomplishments</label>
            <textarea
              value={formData.accomplishments}
              onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
              placeholder="List your key achievements and accomplishments..."
            />
          </div>

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium mb-4">Tools & Technologies</label>
            <div className="space-y-4">
              {tools.map((tool, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tool/Technology name"
                      value={tool.name}
                      onChange={(e) => updateTool(index, 'name', e.target.value)}
                      className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="How you used it"
                      value={tool.usage}
                      onChange={(e) => updateTool(index, 'usage', e.target.value)}
                      className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center">
                    {tools.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTool(index)}
                        className="text-sollo-red hover:text-sollo-red/80 p-2"
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
              className="mt-3 text-sollo-red hover:text-sollo-red/80 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Tool
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 bg-sollo-red text-white hover:bg-sollo-red/90 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}