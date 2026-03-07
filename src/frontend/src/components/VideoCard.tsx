import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { Video } from "../backend.d";
import { useStorage } from "../hooks/useStorage";

interface VideoCardProps {
  video: Video;
  index: number;
  onPlay: (video: Video) => void;
}

function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export function VideoCard({ video, index, onPlay }: VideoCardProps) {
  const { getUrl } = useStorage();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video.isYoutube && video.youtubeUrl) {
      setThumbnailUrl(getYoutubeThumbnail(video.youtubeUrl));
    } else if (video.thumbnailBlobId) {
      getUrl(video.thumbnailBlobId)
        .then((url) => setThumbnailUrl(url))
        .catch(console.error);
    }
  }, [video, getUrl]);

  const delayClass = `reveal-delay-${Math.min((index % 4) + 1, 4)}`;

  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className={`video-card group relative rounded-xl overflow-hidden cursor-pointer reveal ${delayClass} w-full text-left focus-visible:ring-2 focus-visible:ring-cyan`}
      data-ocid={`work.video.item.${index + 1}`}
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-navy-mid overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-mid">
            <div className="w-12 h-12 rounded-full border-2 border-cyan/20 flex items-center justify-center">
              <Play size={20} className="text-cyan/40 ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="video-card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-cyan/90 flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110">
          <Play size={24} className="text-navy-deep ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-1">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-white/60 text-xs mt-1 line-clamp-1">
            {video.description}
          </p>
        )}
      </div>

      {/* Featured badge */}
      {video.featured && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-cyan/20 border border-cyan/30 text-cyan text-xs font-medium">
          Featured
        </div>
      )}

      {/* YouTube badge */}
      {video.isYoutube && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-400 text-xs font-medium">
          YouTube
        </div>
      )}
    </button>
  );
}
