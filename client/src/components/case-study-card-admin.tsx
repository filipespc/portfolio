import { CaseStudy } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface CaseStudyCardAdminProps {
  caseStudy: CaseStudy;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CaseStudyCardAdmin({ 
  caseStudy, 
  onEdit, 
  onDelete 
}: CaseStudyCardAdminProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-sollo-red transition-colors">
      {caseStudy.featuredImage && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-baron text-lg tracking-wide">{caseStudy.title}</h3>
              {caseStudy.isPublished ? (
                <Eye size={16} className="text-green-500" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
              {caseStudy.isFeatured && (
                <span className="text-xs bg-sollo-gold text-white px-2 py-1 rounded">
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">/{caseStudy.slug}</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {caseStudy.description}
            </p>
          </div>
        </div>

        {caseStudy.tags && caseStudy.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {caseStudy.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {caseStudy.createdAt ? new Date(caseStudy.createdAt).toLocaleDateString() : 'No date'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}