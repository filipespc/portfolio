import { useQuery } from "@tanstack/react-query";
import { Experience } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import ExperienceManagement from "@/components/experience-management";
import EducationView from "@/components/education-view";
import { Link, useLocation } from "wouter";

export default function Portfolio() {
  const [location] = useLocation();
  const { data: experiences = [], isLoading, refetch } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  return (
    <div className="min-h-screen bg-white font-apercu">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">FILIPE CARNEIRO</h1>
            <div className="flex items-center space-x-8">
              <Link href="/">
                <span className={`text-sm font-medium transition-colors ${
                  location === '/' ? 'text-sollo-red' : 'text-gray-600 hover:text-sollo-red'
                }`}>
                  EXPERIENCE
                </span>
              </Link>
              <Link href="/playground">
                <span className={`text-sm font-medium transition-colors ${
                  location.startsWith('/playground') ? 'text-sollo-red' : 'text-gray-600 hover:text-sollo-red'
                }`}>
                  PLAYGROUND
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Experience Management with View Selector */}
      <ExperienceManagement
        experiences={experiences}
        isLoading={isLoading}
        onEditExperience={() => {}} // No edit functionality on public page
        onRefetch={refetch}
      />
    </div>
  );
}
