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
