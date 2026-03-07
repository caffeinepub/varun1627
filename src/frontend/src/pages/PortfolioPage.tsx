import { useEffect } from "react";
import { AboutSection } from "../components/AboutSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { Navbar } from "../components/Navbar";
import { WaveBackground } from "../components/WaveBackground";
import { WorkSection } from "../components/WorkSection";
import { useActor } from "../hooks/useActor";
import { useInitialize } from "../hooks/useQueries";
import { useSiteContentMap } from "../hooks/useQueries";

export function PortfolioPage() {
  const { actor } = useActor();
  const initialize = useInitialize();
  const content = useSiteContentMap();

  // Initialize backend with defaults once actor is ready
  useEffect(() => {
    if (actor && !initialize.isPending && !initialize.isSuccess) {
      initialize.mutate();
    }
  }, [actor, initialize]);

  // Update meta tags
  useEffect(() => {
    const title = content.heroTitle ?? "Varun 1627";
    const tagline =
      content.heroTagline ??
      "Cinematic Video Editor | Motion Graphics | Short-Form Content";

    document.title = `${title} — ${tagline}`;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const description = `${title} — ${tagline}`;
    setMeta("description", description.slice(0, 160));
    setOg("og:title", title);
    setOg("og:description", tagline.slice(0, 160));
    setOg("og:type", "website");
    setOg("og:image", "/assets/generated/hero-bg.dim_1920x1080.jpg");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", tagline.slice(0, 160));
  }, [content]);

  return (
    <div className="dark relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated wave background */}
      <WaveBackground />

      {/* Content (above canvas) */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <WorkSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
