import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";

export default function HeroSection() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  return (
    <section className="pt-28 pb-18 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-baron text-4xl md:text-6xl lg:text-7xl tracking-wider mb-8 leading-none">
            {profile?.name?.toUpperCase() || "YOUR NAME"}
          </h1>
          <div className="w-24 h-1 bg-sollo-gold mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            {profile?.briefIntro || "Professional with extensive experience in building scalable digital products and leading cross-functional teams across various industries. Passionate about creating innovative solutions that drive business growth."}
          </p>
        </div>
      </div>
    </section>
  );
}
