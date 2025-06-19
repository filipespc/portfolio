import { useQuery } from "@tanstack/react-query";
import { Education } from "@shared/schema";

export default function EducationView() {
  const { data: education = [], isLoading } = useQuery<Education[]>({
    queryKey: ["/api/education"],
  });

  // Group education by category
  const educationByCategory = education.reduce((acc, edu) => {
    if (!acc[edu.category]) {
      acc[edu.category] = [];
    }
    acc[edu.category].push(edu);
    return acc;
  }, {} as Record<string, Education[]>);

  if (isLoading) {
    return (
      <section className="py-18 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sollo-red"></div>
            <p className="mt-4 text-gray-600">Loading education...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-18 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(educationByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
            <div key={category} className="p-6 border-l-4 border-sollo-gold">
              <h3 className="font-baron text-xl tracking-wide mb-4">{category.toUpperCase()}</h3>
              <div className="space-y-4">
                {items
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4">
                    <div className="mb-2">
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
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(educationByCategory).length === 0 && (
            <div className="text-center py-16 col-span-2">
              <p className="text-gray-600 text-lg">No education data available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}