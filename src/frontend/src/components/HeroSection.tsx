import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSiteContentMap } from "../hooks/useQueries";

export function HeroSection() {
  const content = useSiteContentMap();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroTitle = content.heroTitle ?? "Varun 1627";
  const heroTagline =
    content.heroTagline ??
    "Cinematic Video Editor | Motion Graphics | Short-Form Content";

  // Animate on mount
  useEffect(() => {
    const timeout1 = setTimeout(() => {
      titleRef.current?.classList.add("visible");
    }, 200);
    const timeout2 = setTimeout(() => {
      subtitleRef.current?.classList.add("visible");
    }, 500);
    const timeout3 = setTimeout(() => {
      ctaRef.current?.classList.add("visible");
    }, 800);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <div
          className="reveal mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-medium tracking-[0.2em] uppercase"
          ref={(el) => {
            if (el) {
              el.classList.add("reveal");
              setTimeout(() => el.classList.add("visible"), 100);
            }
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          Video Editor & Motion Artist
        </div>

        {/* Main title */}
        <h1
          ref={titleRef}
          className="reveal font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none mb-6"
        >
          <span className="gradient-text glow-cyan-text block">
            {heroTitle}
          </span>
        </h1>

        {/* Tagline */}
        <p
          ref={subtitleRef}
          className="reveal text-muted-foreground text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed mb-12"
        >
          {heroTagline}
        </p>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="reveal flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            type="button"
            onClick={scrollToWork}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan text-navy-deep font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-glow-lg active:scale-95"
            data-ocid="hero.primary_button"
          >
            View My Work
            <ChevronDown
              size={16}
              className="group-hover:translate-y-0.5 transition-transform duration-200"
            />
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-foreground/80 font-medium text-sm tracking-wide hover:border-cyan/30 hover:text-foreground transition-all duration-300"
            data-ocid="hero.secondary_button"
          >
            Get In Touch
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
        <span className="text-xs tracking-[0.2em] uppercase font-medium">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
