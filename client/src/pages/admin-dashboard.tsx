import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Experience, Profile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExperienceModal from "@/components/experience-modal";
import ExperienceCard from "@/components/experience-card";

export default function AdminDashboard() {
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences'>('profile');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile data and mutations
  const { data: profile, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "",
    briefIntro: profile?.briefIntro || "",
    educationCategories: profile?.educationCategories || [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const response = await apiRequest('PUT', '/api/admin/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      refetchProfile();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Experience data
  const { data: experiences = [], refetch: refetchExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/admin/experiences"],
  });

  // Update form when profile loads
  useState(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        briefIntro: profile.briefIntro,
        educationCategories: profile.educationCategories || [],
      });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowExperienceModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setShowExperienceModal(true);
  };

  const handleExperienceModalClose = () => {
    setShowExperienceModal(false);
    setEditingExperience(null);
  };

  const handleExperienceChange = () => {
    refetchExperiences();
    handleExperienceModalClose();
  };

  const addEducationCategory = () => {
    const newCategory = prompt("Enter new education category:");
    if (newCategory && !profileForm.educationCategories.includes(newCategory)) {
      setProfileForm({
        ...profileForm,
        educationCategories: [...profileForm.educationCategories, newCategory],
      });
    }
  };

  const removeEducationCategory = (index: number) => {
    setProfileForm({
      ...profileForm,
      educationCategories: profileForm.educationCategories.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-white font-apercu texture-overlay">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">ADMIN DASHBOARD</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => logout()}
                className="text-sollo-red hover:text-sollo-red/80 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'profile'
                ? 'bg-white border-sollo-red text-sollo-red'
                : 'bg-white border-gray-200 hover:border-sollo-red hover:text-sollo-red'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'experiences'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Experiences
          </button>
        </div>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-50 p-8">
            <h2 className="font-baron text-xl tracking-wide mb-6">PROFILE SETTINGS</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brief Introduction</label>
                <textarea
                  rows={4}
                  value={profileForm.briefIntro}
                  onChange={(e) => setProfileForm({ ...profileForm, briefIntro: e.target.value })}
                  className="w-full p-3 border border-gray-200 focus:border-sollo-red focus:outline-none"
                  placeholder="Write a brief introduction about yourself..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Education Categories</label>
                <div className="space-y-2 mb-4">
                  {profileForm.educationCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 border border-gray-200">
                      <span>{category}</span>
                      <button
                        type="button"
                        onClick={() => removeEducationCategory(index)}
                        className="text-sollo-red hover:text-sollo-red/80"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addEducationCategory}
                  className="text-sollo-gold hover:text-sollo-gold/80 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Category
                </button>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-sollo-red text-white px-8 py-3 font-medium hover:bg-sollo-red/90 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-baron text-xl tracking-wide">MANAGE EXPERIENCES</h2>
              <button
                onClick={handleAddExperience}
                className="bg-sollo-gold text-white px-6 py-3 font-medium hover:bg-sollo-gold/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Experience
              </button>
            </div>

            <div className="space-y-8">
              {experiences.map(experience => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onEdit={() => handleEditExperience(experience)}
                  onRefetch={refetchExperiences}
                />
              ))}
              {experiences.length === 0 && (
                <div className="text-center py-16 bg-gray-50">
                  <p className="text-gray-600 text-lg">No experiences added yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Experience" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <ExperienceModal
          experience={editingExperience}
          onClose={handleExperienceModalClose}
          onSave={handleExperienceChange}
        />
      )}
    </div>
  );
}