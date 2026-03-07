import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Video } from "../backend.d";
import { useStorage } from "../hooks/useStorage";

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { getUrl } = useStorage();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!video.isYoutube && video.blobId) {
      getUrl(video.blobId)
        .then((url) => setBlobUrl(url))
        .catch(console.error);
    }
  }, [video, getUrl]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const youtubeId = video.youtubeUrl
    ? extractYoutubeId(video.youtubeUrl)
    : null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via useEffect above
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      data-ocid="videoplayer.modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal content */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: click stops propagation only */}
      <div
        className="relative z-10 w-full max-w-5xl mx-4 rounded-2xl overflow-hidden shadow-cinematic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full glass hover:bg-white/10 transition-colors text-foreground"
          data-ocid="videoplayer.close_button"
          aria-label="Close video"
        >
          <X size={20} />
        </button>

        {/* Video info bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="font-display font-bold text-xl text-white">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/60 text-sm mt-1">{video.description}</p>
          )}
        </div>

        {/* Player */}
        <div className="aspect-video bg-black">
          {video.isYoutube && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={video.title}
            />
          ) : blobUrl ? (
            // biome-ignore lint/a11y/useMediaCaption: user-uploaded content captions not available
            <video
              src={blobUrl}
              controls
              autoPlay
              className="w-full h-full"
              title={video.title}
            >
              Your browser does not support HTML5 video.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Loading video...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
