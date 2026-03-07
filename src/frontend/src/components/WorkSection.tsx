import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import type { Video } from "../backend.d";
import {
  useCategories,
  useSiteContentMap,
  useVideos,
} from "../hooks/useQueries";
import { VideoCard } from "./VideoCard";
import { VideoPlayer } from "./VideoPlayer";

export function WorkSection() {
  const content = useSiteContentMap();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: videos = [], isLoading: vidLoading } = useVideos();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const title = content.workSectionTitle ?? "My Work";
  const subtitle =
    content.workSectionSubtitle ??
    "Explore my portfolio across different styles and formats.";

  // Sort categories by order
  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const filteredVideos =
    activeCategory === "all"
      ? [...videos].sort((a, b) => Number(a.order) - Number(b.order))
      : videos
          .filter((v) => v.categoryId === activeCategory)
          .sort((a, b) => Number(a.order) - Number(b.order));

  // Scroll reveal for section
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
      { threshold: 0.05 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Re-trigger reveal when filter changes (activeCategory is read via closure but not a dep)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-runs on activeCategory change
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll(".video-card");
    for (const card of cards) {
      card.classList.remove("visible");
    }
    const timer = setTimeout(() => {
      for (const card of grid.querySelectorAll(".video-card")) {
        card.classList.add("visible");
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const isLoading = catLoading || vidLoading;

  return (
    <section id="work" ref={sectionRef} className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="reveal mb-4 inline-flex items-center gap-2 text-cyan text-xs font-medium tracking-[0.2em] uppercase">
            <span className="w-8 h-px bg-cyan" />
            Portfolio
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-display font-black text-4xl md:text-6xl tracking-tight text-foreground mb-4">
            {title}
          </h2>
          <p className="reveal text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Category filter */}
        <div
          className="reveal flex flex-wrap gap-2 justify-center mb-12"
          data-ocid="work.filter.tab"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-cyan text-navy-deep shadow-glow-sm"
                : "bg-white/5 text-muted-foreground border border-white/10 hover:border-cyan/30 hover:text-foreground"
            }`}
            data-ocid="work.all.tab"
          >
            All
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-cyan text-navy-deep shadow-glow-sm"
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:border-cyan/30 hover:text-foreground"
              }`}
              data-ocid={"work.category.tab"}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Video grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
              <Skeleton
                key={id}
                className="aspect-video rounded-xl bg-white/5"
                data-ocid="work.loading_state"
              />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div
            className="text-center py-24 text-muted-foreground"
            data-ocid="work.empty_state"
          >
            <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <p className="text-lg font-medium">No videos yet</p>
            <p className="text-sm mt-1">
              Videos will appear here once added from the admin panel.
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVideos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                index={i}
                onPlay={setPlayingVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video lightbox */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </section>
  );
}
