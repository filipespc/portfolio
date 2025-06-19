import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Education, InsertEducation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EducationModalProps {
  education?: Education | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EducationModal({ education, onClose, onSave }: EducationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    link: "",
    date: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (education) {
      setFormData({
        name: education.name,
        category: education.category,
        link: education.link || "",
        date: education.date || "",
      });
    }
  }, [education]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertEducation) => {
      if (education) {
        await apiRequest(`/api/admin/education/${education.id}`, "PUT", data);
      } else {
        await apiRequest("/api/admin/education", "POST", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      toast({
        title: "Success",
        description: `Education ${education ? "updated" : "created"} successfully`,
      });
      onSave();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${education ? "update" : "create"} education`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and category are required",
        variant: "destructive",
      });
      return;
    }

    const data: InsertEducation = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      link: formData.link.trim() || undefined,
      date: formData.date.trim() || undefined,
      sortOrder: 0,
    };

    saveMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="font-baron text-xl tracking-wide">
            {education ? "EDIT EDUCATION" : "ADD EDUCATION"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
              placeholder="e.g., Machine Learning Certification"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
              placeholder="e.g., Artificial Intelligence"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Certificate Link</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
              placeholder="https://example.com/certificate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border border-gray-200 focus:border-sollo-gold focus:outline-none"
              placeholder="e.g., 2024-12 or December 2024"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-6 py-3 bg-sollo-red text-white hover:bg-sollo-red/90 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}