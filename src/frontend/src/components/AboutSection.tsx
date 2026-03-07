import { useEffect, useRef } from "react";
import { useSiteContentMap } from "../hooks/useQueries";

export function AboutSection() {
  const content = useSiteContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  const title = content.aboutSectionTitle ?? "About Me";
  const bio =
    content.aboutBio ??
    "I'm a professional video editor specializing in cinematic storytelling, motion graphics, and short-form content for brands and creators worldwide.";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            for (const el of entry.target.querySelectorAll(".reveal")) {
              el.classList.add("visible");
            }
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: "Projects Completed", value: "200+" },
    { label: "Clients Worldwide", value: "50+" },
    { label: "Years of Experience", value: "5+" },
    { label: "Awards Won", value: "12" },
  ];

  return (
    <section id="about" ref={sectionRef} className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="reveal mb-4 inline-flex items-center gap-2 text-cyan text-xs font-medium tracking-[0.2em] uppercase">
              <span className="w-8 h-px bg-cyan" />
              About
            </div>
            <h2 className="reveal font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground mb-8 leading-tight">
              {title}
            </h2>
            <p className="reveal text-muted-foreground text-lg leading-relaxed mb-10 reveal-delay-1">
              {bio}
            </p>

            {/* Stats row */}
            <div className="reveal grid grid-cols-2 gap-4 reveal-delay-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan/20 transition-colors duration-200"
                >
                  <div className="font-display font-black text-3xl text-cyan mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Decorative visual */}
          <div className="reveal reveal-delay-2 relative">
            {/* Decorative frame */}
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-2xl border border-cyan/10 shadow-glow" />

              {/* Background gradient */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-navy-deep" />
                <div
                  className="w-full h-full rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.14 0.03 195) 0%, oklch(0.1 0.008 240) 50%, oklch(0.12 0.015 260) 100%)",
                  }}
                />
              </div>

              {/* Film strips decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Center icon */}
                  <div className="w-20 h-20 rounded-full border-2 border-cyan/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-cyan/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[10px] border-l-cyan border-y-[6px] border-y-transparent ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-2 h-2 rounded-full bg-cyan/40"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateX(48px) translateY(-50%)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Skill tags floating */}
              {[
                { label: "Premiere Pro", x: "8%", y: "15%" },
                { label: "After Effects", x: "55%", y: "8%" },
                { label: "DaVinci", x: "5%", y: "78%" },
                { label: "Motion", x: "60%", y: "84%" },
              ].map((tag) => (
                <div
                  key={tag.label}
                  className="absolute px-3 py-1 rounded-full glass border border-cyan/20 text-cyan text-xs font-medium"
                  style={{ left: tag.x, top: tag.y }}
                >
                  {tag.label}
                </div>
              ))}
            </div>

            {/* Corner accents */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-cyan/20 rounded-tr-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-cyan/20 rounded-bl-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
