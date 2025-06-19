import { useState, useEffect } from "react";
import { Experience } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExperienceCardAdmin from "./experience-card-admin";

interface SortableExperienceListProps {
  experiences: Experience[];
  onEditExperience: (experience: Experience) => void;
  onDeleteExperience: (id: number) => void;
}

export default function SortableExperienceList({
  experiences,
  onEditExperience,
  onDeleteExperience,
}: SortableExperienceListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [localExperiences, setLocalExperiences] = useState(experiences);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update local state when experiences prop changes
  useEffect(() => {
    setLocalExperiences(experiences);
  }, [experiences]);

  const reorderMutation = useMutation({
    mutationFn: async (experienceIds: number[]) => {
      await apiRequest("/api/admin/experiences/reorder", "PUT", { experienceIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Success",
        description: "Experience order updated successfully",
      });
    },
    onError: () => {
      // Revert local state on error
      setLocalExperiences(experiences);
      toast({
        title: "Error",
        description: "Failed to update experience order",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      const newExperiences = [...localExperiences];
      const draggedItem = newExperiences[draggedIndex];
      
      // Remove dragged item
      newExperiences.splice(draggedIndex, 1);
      
      // Insert at new position
      newExperiences.splice(draggedOverIndex, 0, draggedItem);
      
      setLocalExperiences(newExperiences);
      
      // Send reorder request
      const experienceIds = newExperiences.map(exp => exp.id);
      reorderMutation.mutate(experienceIds);
    }
    
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {localExperiences.map((experience, index) => (
        <div
          key={experience.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          className={`transition-all ${
            draggedOverIndex === index && draggedIndex !== index
              ? 'border-t-4 border-sollo-gold'
              : ''
          }`}
        >
          <ExperienceCardAdmin
            experience={experience}
            onEdit={() => onEditExperience(experience)}
            onDelete={() => onDeleteExperience(experience.id)}
            isDragging={draggedIndex === index}
            dragHandleProps={{
              onMouseDown: (e: React.MouseEvent) => {
                e.preventDefault();
                // The draggable attribute on the parent div handles the drag
              }
            }}
          />
        </div>
      ))}
      
      {localExperiences.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200">
          <p className="text-gray-600 text-lg">No experiences added yet.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Experience" to get started.</p>
        </div>
      )}
      
      {reorderMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-sollo-gold text-white px-4 py-2 rounded shadow-lg">
          Updating order...
        </div>
      )}
    </div>
  );
}