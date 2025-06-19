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

type ViewMode = 'all' | 'tools' | 'industries' | 'education';

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

      // Process education
      const education = parseEducation(exp.education || []);
      education.forEach(edu => {
        if (!educationMap.has(edu.category)) {
          educationMap.set(edu.category, []);
        }
        educationMap.get(edu.category)!.push({ name: edu.name, link: edu.link, date: edu.date, experience: exp });
      });
    });

    return { toolsMap, industriesMap, educationMap };
  }, [experiences]);

  const renderAllView = () => (
    <div className="space-y-8">
      {experiences.map(experience => (
        <div
          key={experience.id}
          className="mb-12 p-8 bg-gray-50 hover:bg-gray-100 transition-colors"
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

            {/* Education - Full width */}
            {parseEducation(experience.education || []).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Education Acquired</h4>
                <div className="flex flex-wrap gap-2">
                  {parseEducation(experience.education || []).map((edu, index) => {
                    console.log('Rendering education item:', edu);
                    return (
                      <div key={index} className="bg-sollo-gold bg-opacity-20 text-sollo-gold px-3 py-2 text-sm border">
                        {edu.link ? (
                          <a
                            href={edu.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-sollo-gold/80 transition-colors inline-flex items-center gap-1"
                          >
                            {edu.name}
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span>{edu.name}</span>
                        )}
                        {edu.date && (
                          <div className="text-xs opacity-70 mt-1">
                            {edu.date}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
    <div className="grid gap-8">
      {Array.from(processedData.toolsMap.entries()).map(([toolName, toolData]) => (
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
  );

  const renderIndustriesView = () => (
    <div className="grid gap-8">
      {Array.from(processedData.industriesMap.entries()).map(([industry, industryExperiences]) => (
        <div key={industry} className="p-6 border-l-4 border-sollo-red">
          <h3 className="font-baron text-xl tracking-wide mb-4">{industry.toUpperCase()}</h3>
          <div className="space-y-4">
            {industryExperiences.map(exp => (
              <div key={exp.id} className="bg-gray-50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{exp.jobTitle}</h4>
                    <p className="text-sm text-sollo-red font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                    {exp.isCurrentJob ? ' Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <FormattedText text={exp.accomplishments} className="text-sm text-gray-700" />
              </div>
            ))}
          </div>
        </div>
      ))}
      {processedData.industriesMap.size === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No industry data available.</p>
        </div>
      )}
    </div>
  );

  const renderEducationView = () => (
    <div className="grid md:grid-cols-2 gap-8">
      {Array.from(processedData.educationMap.entries()).map(([category, educationItems]) => (
        <div key={category} className="p-6 bg-gray-50">
          <h3 className="font-baron text-xl tracking-wide mb-4 text-sollo-red">
            {category.toUpperCase()}
          </h3>
          <div className="space-y-3">
            {educationItems.map((item, index) => (
              <div key={index} className="border-l-4 border-sollo-red pl-4">
                <div className="flex items-center gap-2">
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
                <p className="text-sm text-sollo-red font-medium">{item.experience.company}</p>
                <p className="text-sm text-gray-600">{item.experience.industry}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {processedData.educationMap.size === 0 && (
        <div className="text-center py-16 col-span-2">
          <p className="text-gray-600 text-lg">No education data available.</p>
        </div>
      )}
    </div>
  );

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
        {/* View Navigation */}
        <div className="mb-12">
          <h2 className="font-baron text-4xl md:text-5xl tracking-wider mb-8 text-center">EXPERIENCE</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-3 text-sm font-medium transition-colors border ${
                viewMode === 'all'
                  ? 'bg-white border-sollo-red text-sollo-red'
                  : 'bg-white border-gray-200 hover:border-sollo-red hover:text-sollo-red'
              }`}
            >
              All Experiences
            </button>
            <button
              onClick={() => setViewMode('tools')}
              className={`px-6 py-3 text-sm font-medium transition-colors border ${
                viewMode === 'tools'
                  ? 'bg-white border-sollo-gold text-sollo-gold'
                  : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
              }`}
            >
              By Tools
            </button>
            <button
              onClick={() => setViewMode('industries')}
              className={`px-6 py-3 text-sm font-medium transition-colors border ${
                viewMode === 'industries'
                  ? 'bg-white border-sollo-red text-sollo-red'
                  : 'bg-white border-gray-200 hover:border-sollo-red hover:text-sollo-red'
              }`}
            >
              By Industries
            </button>
            <button
              onClick={() => setViewMode('education')}
              className={`px-6 py-3 text-sm font-medium transition-colors border ${
                viewMode === 'education'
                  ? 'bg-white border-sollo-gold text-sollo-gold'
                  : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
              }`}
            >
              Education
            </button>
          </div>
        </div>

        {/* View Content */}
        <div>
          {viewMode === 'all' && renderAllView()}
          {viewMode === 'tools' && renderToolsView()}
          {viewMode === 'industries' && renderIndustriesView()}
          {viewMode === 'education' && renderEducationView()}
        </div>
      </div>
    </section>
  );
}
