import { useState, useMemo } from "react";
import { Experience } from "@shared/schema";
import { parseTools, parseEducation, formatDateRange } from "@/lib/utils";
import FormattedText from "./formatted-text";

interface ExperienceManagementProps {
  experiences: Experience[];
  isLoading: boolean;
  onEditExperience: (experience: Experience) => void;
  onRefetch: () => void;
}

type ViewMode = 'all' | 'tools' | 'industries';

type EducationItem = {
  name: string;
  link?: string;
  date?: string;
  experience: Experience;
};

export default function ExperienceManagement({
  experiences,
  isLoading,
  onEditExperience,
  onRefetch,
}: ExperienceManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [toolsSortOrder, setToolsSortOrder] = useState<'alphabetical' | 'frequency'>('alphabetical');
  const [industriesSortOrder, setIndustriesSortOrder] = useState<'alphabetical' | 'frequency'>('alphabetical');

  const processedData = useMemo(() => {
    const toolsMap = new Map<string, { experiences: Experience[], usage: Map<string, string> }>();
    const industriesMap = new Map<string, Experience[]>();
    const educationMap = new Map<string, Array<EducationItem>>();

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

      // Education is now managed separately - remove this processing
    });

    return { toolsMap, industriesMap, educationMap };
  }, [experiences]);

  const getSortedTools = () => {
    const toolsArray = Array.from(processedData.toolsMap.entries());
    
    switch (toolsSortOrder) {
      case 'alphabetical':
        return toolsArray.sort(([a], [b]) => a.localeCompare(b));
      case 'frequency':
        return toolsArray.sort(([, a], [, b]) => b.experiences.length - a.experiences.length);
      default:
        return toolsArray;
    }
  };

  const getSortedIndustries = () => {
    const industriesArray = Array.from(processedData.industriesMap.entries());
    
    switch (industriesSortOrder) {
      case 'alphabetical':
        return industriesArray.sort(([a], [b]) => a.localeCompare(b));
      case 'frequency':
        return industriesArray.sort(([, a], [, b]) => b.length - a.length);
      default:
        return industriesArray;
    }
  };

  const renderAllView = () => (
    <div className="space-y-8">
      {experiences.map(experience => (
        <div key={experience.id} className="bg-gray-50 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-baron text-xl tracking-wide mb-1">{experience.jobTitle.toUpperCase()}</h3>
              <p className="text-sollo-red font-medium mb-1">{experience.company}</p>
              <p className="text-sollo-gold font-medium mb-1">{experience.industry}</p>
              <p className="text-sm text-gray-600">
                {formatDateRange(experience.startDate, experience.endDate, experience.isCurrentJob || false)}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Tools & Technologies - Full width at top */}
            {parseTools(experience.tools || []).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {parseTools(experience.tools || []).map((tool, index) => (
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
      ))}
      {experiences.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No experiences added yet.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Experience" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderToolsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tools & Technologies</h3>
        <select
          value={toolsSortOrder}
          onChange={(e) => setToolsSortOrder(e.target.value as any)}
          className="px-3 py-1 border border-gray-200 rounded text-sm focus:border-sollo-gold focus:outline-none"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="frequency">By Frequency</option>
        </select>
      </div>
      <div className="grid gap-8">
        {getSortedTools().map(([toolName, toolData]) => (
          <div key={toolName} className="p-6 border-l-4 border-sollo-gold">
            <h3 className="font-baron text-xl tracking-wide mb-4">{toolName.toUpperCase()}</h3>
            <div className="space-y-4">
              {toolData.experiences.map(exp => (
                <div key={exp.id} className="bg-gray-50 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{exp.jobTitle.toUpperCase()}</h4>
                      <p className="text-sm text-sollo-red font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">{exp.industry}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {toolData.usage.get(exp.id.toString()) || 'Usage description not provided'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {processedData.toolsMap.size === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No tools data available.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderIndustriesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Industries</h3>
        <select
          value={industriesSortOrder}
          onChange={(e) => setIndustriesSortOrder(e.target.value as any)}
          className="px-3 py-1 border border-gray-200 rounded text-sm focus:border-sollo-gold focus:outline-none"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="frequency">By Frequency</option>
        </select>
      </div>
      <div className="grid gap-8">
        {getSortedIndustries().map(([industry, industryExperiences]) => (
          <div key={industry} className="p-6 border-l-4 border-sollo-red">
            <h3 className="font-baron text-xl tracking-wide mb-4">{industry.toUpperCase()}</h3>
            <div className="space-y-4">
              {industryExperiences.map(exp => (
                <div key={exp.id} className="bg-gray-50 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{exp.jobTitle.toUpperCase()}</h4>
                      <p className="text-sm text-sollo-red font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob || false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {processedData.industriesMap.size === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No industries data available.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Education view removed - education is now managed separately

  if (isLoading) {
    return (
      <section className="py-18 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sollo-red"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-18 px-6">
      <div className="max-w-6xl mx-auto">
        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-gray-100 p-1 rounded">
            {[
              { key: 'all', label: 'All' },
              { key: 'tools', label: 'Tools' },
              { key: 'industries', label: 'Industries' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as ViewMode)}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  viewMode === key
                    ? 'bg-white text-sollo-red shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'all' && renderAllView()}
        {viewMode === 'tools' && renderToolsView()}
        {viewMode === 'industries' && renderIndustriesView()}
      </div>
    </section>
  );
}