import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Experience } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import ExperienceManagement from "@/components/experience-management";
import ExperienceModal from "@/components/experience-modal";

export default function Portfolio() {
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const { data: experiences = [], isLoading, refetch } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExperience(null);
  };

  const handleExperienceChange = () => {
    refetch();
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-white font-apercu">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">PORTFOLIO</h1>
            <button
              onClick={handleAddExperience}
              className="bg-sollo-red text-white px-6 py-2 text-sm font-medium hover:bg-sollo-red/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Experience
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Experience Management */}
      <ExperienceManagement
        experiences={experiences}
        isLoading={isLoading}
        onEditExperience={handleEditExperience}
        onRefetch={refetch}
      />

      {/* Experience Modal */}
      {showModal && (
        <ExperienceModal
          experience={editingExperience}
          onClose={handleCloseModal}
          onSave={handleExperienceChange}
        />
      )}
    </div>
  );
}
