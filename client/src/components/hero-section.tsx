import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";

export default function HeroSection() {
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  if (isLoading) {
    return (
      <section className="pt-28 pb-18 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-16 md:h-24 lg:h-28 bg-gray-200 rounded mb-8 mx-auto max-w-2xl"></div>
              <div className="w-24 h-1 bg-gray-200 mx-auto mb-8"></div>
              <div className="space-y-3 max-w-3xl mx-auto">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-4/5 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-3/5 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-18 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-baron text-4xl md:text-6xl lg:text-7xl tracking-wider mb-8 leading-none">
            {profile?.name?.toUpperCase()}
          </h1>
          <div className="w-24 h-1 bg-sollo-gold mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            {profile?.briefIntro}
          </p>
        </div>
      </div>
    </section>
  );
}
