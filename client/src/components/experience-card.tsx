import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Experience } from "@shared/schema";
import { formatDateRange, parseTools, parseEducation } from "@/lib/utils";
import FormattedText from "./formatted-text";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExperienceCardProps {
  experience: Experience;
  onEdit: () => void;
  onRefetch: () => void;
}

export default function ExperienceCard({ experience, onEdit, onRefetch }: ExperienceCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      onRefetch();
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this experience?')) {
      deleteMutation.mutate(experience.id);
    }
  };

  const tools = parseTools(experience.tools || []);
  const education = parseEducation(experience.education || []);

  return (
    <div
      className="mb-12 p-8 bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-baron text-2xl tracking-wide mb-2">{experience.jobTitle.toUpperCase()}</h3>
          <p className="text-sollo-red font-medium text-lg">{experience.company}</p>
          <p className="text-sollo-gold font-medium">{experience.industry}</p>
          <p className="text-gray-500">
            {formatDateRange(experience.startDate, experience.endDate, experience.isCurrentJob || false)}
          </p>
        </div>
        <div className={`transition-opacity flex gap-2 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onEdit}
            className="text-sollo-gold hover:text-sollo-gold/80 p-2"
            title="Edit experience"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-sollo-red hover:text-sollo-red/80 p-2 disabled:opacity-50"
            title="Delete experience"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Tools & Technologies - Full width at top */}
        {tools.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, index) => (
                <span 
                  key={index} 
                  className="bg-white px-3 py-1 text-sm border border-gray-200 cursor-help relative group"
                  title={tool.usage || tool.name}
                >
                  {tool.name}
                  {tool.usage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      {tool.usage}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education - Full width */}
        {education.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Education Acquired</h4>
            <div className="flex flex-wrap gap-2">
              {education.map((edu, index) => (
                <div key={index} className="bg-sollo-gold bg-opacity-20 px-3 py-2 text-sm">
                  <div className="text-black font-bold">
                    {edu.link ? (
                      <a
                        href={edu.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-700 underline flex items-center gap-1"
                      >
                        {edu.name}
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      edu.name
                    )}
                  </div>
                  {edu.date && (
                    <div className="text-xs text-gray-700 mt-1 font-bold">
                      {edu.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accomplishments and Description - Full width */}
        <div>
          <h4 className="font-semibold mb-3">Key Accomplishments</h4>
          <FormattedText text={experience.accomplishments} className="text-gray-700 leading-relaxed" />
          {experience.description && (
            <>
              <h4 className="font-semibold mb-3 mt-6">Job Description</h4>
              <FormattedText text={experience.description} className="text-gray-700 leading-relaxed" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
