import { Experience } from "@shared/schema";
import { formatDateRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";

interface ExperienceCardAdminProps {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function ExperienceCardAdmin({ 
  experience, 
  onEdit, 
  onDelete, 
  isDragging = false,
  dragHandleProps 
}: ExperienceCardAdminProps) {
  return (
    <div 
      className={`bg-white border border-gray-200 p-6 transition-all ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
          >
            <GripVertical size={20} />
          </div>
          
          {/* Experience Content */}
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="font-baron text-lg tracking-wide mb-1">
                {experience.jobTitle.toUpperCase()}
              </h3>
              <p className="text-sollo-red font-medium mb-1">{experience.company}</p>
              <p className="text-sollo-gold font-medium mb-1">{experience.industry}</p>
              <p className="text-sm text-gray-600">
                {formatDateRange(experience.startDate, experience.endDate, experience.isCurrentJob || false)}
              </p>
            </div>
            
            {/* Brief description preview */}
            <p className="text-sm text-gray-700 line-clamp-2">
              {experience.accomplishments.substring(0, 150)}
              {experience.accomplishments.length > 150 && '...'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="text-sollo-gold hover:text-sollo-gold hover:bg-sollo-gold/10"
          >
            <Edit size={16} />
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="text-sollo-red hover:text-sollo-red hover:bg-sollo-red/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}