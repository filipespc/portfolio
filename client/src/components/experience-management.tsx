import { useState, useMemo, useEffect } from "react";
import { Experience, Profile, CaseStudy } from "@shared/schema";
import { parseTools, formatDateRange } from "@/lib/utils";
import FormattedText from "./formatted-text";
import EducationView from "./education-view";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

interface ExperienceManagementProps {
  experiences: Experience[];
  isLoading: boolean;
  onEditExperience: (experience: Experience) => void;
  onRefetch: () => void;
}

type MainView = 'experiences' | 'education' | 'playground';
type ExperienceViewMode = 'all' | 'tools' | 'industries';

function PlaygroundView() {
  const { data: caseStudies = [], isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-gray-600">Loading case studies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caseStudies.map((caseStudy) => (
          <Link key={caseStudy.id} href={`/case-study/${caseStudy.slug}`}>
            <div className="bg-white border border-gray-200 hover:border-sollo-red transition-colors cursor-pointer group overflow-hidden rounded-lg">
              {caseStudy.featuredImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={caseStudy.featuredImage}
                    alt={caseStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-sollo-red bg-red-50 px-2 py-1 rounded">
                    Case Study
                  </span>
                  {caseStudy.isFeatured && (
                    <span className="text-xs font-medium text-sollo-gold bg-yellow-50 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
                
                <h3 className="font-baron text-lg tracking-wide mb-2 group-hover:text-sollo-red transition-colors">
                  {caseStudy.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {caseStudy.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{caseStudy.createdAt ? new Date(caseStudy.createdAt).toLocaleDateString() : 'Recently'}</span>
                  <span>5 min read</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {caseStudies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600">No case studies available yet.</p>
        </div>
      )}
    </div>
  );
}

export default function ExperienceManagement({
  experiences,
  isLoading,
  onEditExperience,
  onRefetch,
}: ExperienceManagementProps) {
  const [location] = useLocation();
  const [mainView, setMainView] = useState<MainView>('experiences');
  const [experienceViewMode, setExperienceViewMode] = useState<ExperienceViewMode>('all');

  // Handle URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'playground') {
      setMainView('playground');
      // Clear the URL parameter
      window.history.replaceState({}, '', '/');
    }
  }, [location]);

  // Fetch profile data for saved ordering
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

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

  // Get sorted tools and industries using saved ordering from admin
  const getSortedTools = () => {
    const toolsArray = Array.from(processedData.toolsMap.entries());
    const savedOrder = profile?.toolsOrder || [];
    
    if (savedOrder.length > 0) {
      // Use admin-configured order
      const orderedTools = savedOrder
        .map(toolName => toolsArray.find(([name]) => name === toolName))
        .filter((item): item is [string, { experiences: Experience[], usage: Map<string, string> }] => item !== undefined);
      
      // Add any new tools not in saved order
      const remainingTools = toolsArray.filter(([name]) => !savedOrder.includes(name));
      return [...orderedTools, ...remainingTools.sort(([a], [b]) => a.localeCompare(b))];
    }
    
    // Fallback to alphabetical if no saved order
    return toolsArray.sort(([a], [b]) => a.localeCompare(b));
  };

  const getSortedIndustries = () => {
    const industriesArray = Array.from(processedData.industriesMap.entries());
    const savedOrder = profile?.industriesOrder || [];
    
    if (savedOrder.length > 0) {
      // Use admin-configured order
      const orderedIndustries = savedOrder
        .map(industryName => industriesArray.find(([name]) => name === industryName))
        .filter((item): item is [string, Experience[]] => item !== undefined);
      
      // Add any new industries not in saved order
      const remainingIndustries = industriesArray.filter(([name]) => !savedOrder.includes(name));
      return [...orderedIndustries, ...remainingIndustries.sort(([a], [b]) => a.localeCompare(b))];
    }
    
    // Fallback to alphabetical if no saved order
    return industriesArray.sort(([a], [b]) => a.localeCompare(b));
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
            {/* Tools & Technologies */}
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

            {/* Accomplishments and Description */}
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-baron text-lg tracking-wide">TOOLS & TECHNOLOGIES</h3>
      </div>
      
      {getSortedTools().map(([toolName, { experiences: toolExperiences, usage }]) => (
        <div key={toolName} className="bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-baron text-xl tracking-wide">{toolName.toUpperCase()}</h3>
            <span className="text-sm text-gray-500">{toolExperiences.length} experience{toolExperiences.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="space-y-4">
            {toolExperiences.map(exp => (
              <div key={exp.id} className="border-l-4 border-sollo-gold pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.jobTitle}</h4>
                    <p className="text-sollo-red font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob || false)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-700 font-medium mb-2">Usage:</p>
                  <p className="text-sm text-gray-600">{usage.get(exp.id.toString()) || 'No specific usage details'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderIndustriesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-baron text-lg tracking-wide">BY INDUSTRIES</h3>
      </div>
      
      {getSortedIndustries().map(([industryName, industryExperiences]) => (
        <div key={industryName} className="bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-baron text-xl tracking-wide">{industryName.toUpperCase()}</h3>
            <span className="text-sm text-gray-500">{industryExperiences.length} experience{industryExperiences.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="space-y-6">
            {industryExperiences.map(exp => (
              <div key={exp.id} className="border-l-4 border-sollo-red pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.jobTitle}</h4>
                    <p className="text-sollo-red font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob || false)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <FormattedText text={exp.accomplishments} className="text-gray-700 leading-relaxed text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-gray-600">Loading experiences...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Main View Selector - Tab Style */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setMainView('experiences')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              mainView === 'experiences'
                ? 'border-sollo-red text-sollo-red'
                : 'border-transparent text-gray-500 hover:text-sollo-red hover:border-gray-300'
            }`}
          >
            Work Experience
          </button>
          <button
            onClick={() => setMainView('education')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              mainView === 'education'
                ? 'border-sollo-red text-sollo-red'
                : 'border-transparent text-gray-500 hover:text-sollo-red hover:border-gray-300'
            }`}
          >
            Education
          </button>
          <button
            onClick={() => setMainView('playground')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              mainView === 'playground'
                ? 'border-sollo-red text-sollo-red'
                : 'border-transparent text-gray-500 hover:text-sollo-red hover:border-gray-300'
            }`}
          >
            Playground
          </button>
        </div>
      </div>

      {/* Experience Views */}
      {mainView === 'experiences' && (
        <>
          {/* Experience View Mode Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setExperienceViewMode('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border ${
                experienceViewMode === 'all'
                  ? 'bg-sollo-gold text-white border-sollo-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setExperienceViewMode('tools')}
              className={`px-4 py-2 text-sm font-medium transition-colors border ${
                experienceViewMode === 'tools'
                  ? 'bg-sollo-gold text-white border-sollo-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
              }`}
            >
              By Tools
            </button>
            <button
              onClick={() => setExperienceViewMode('industries')}
              className={`px-4 py-2 text-sm font-medium transition-colors border ${
                experienceViewMode === 'industries'
                  ? 'bg-sollo-gold text-white border-sollo-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
              }`}
            >
              By Industries
            </button>
          </div>

          {/* Render the selected experience view */}
          {experienceViewMode === 'all' && renderAllView()}
          {experienceViewMode === 'tools' && renderToolsView()}
          {experienceViewMode === 'industries' && renderIndustriesView()}
        </>
      )}

      {/* Education View */}
      {mainView === 'education' && <EducationView />}

      {/* Playground View */}
      {mainView === 'playground' && <PlaygroundView />}
    </div>
  );
}