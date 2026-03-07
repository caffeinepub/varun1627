import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Image,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Video } from "../../backend.d";
import {
  useCategories,
  useCreateVideo,
  useDeleteVideo,
  useUpdateVideo,
  useVideos,
} from "../../hooks/useQueries";
import { useStorage } from "../../hooks/useStorage";

function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

interface VideoFormData {
  title: string;
  description: string;
  categoryId: string;
  isYoutube: boolean;
  youtubeUrl: string;
  featured: boolean;
  blobId: string | null;
  thumbnailBlobId: string | null;
}

const defaultForm: VideoFormData = {
  title: "",
  description: "",
  categoryId: "",
  isYoutube: true,
  youtubeUrl: "",
  featured: false,
  blobId: null,
  thumbnailBlobId: null,
};

export function VideosManager() {
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: categories = [] } = useCategories();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const { upload } = useStorage();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoFormData>(defaultForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const sortedVideos = [...videos].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );
  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const getYoutubeThumbnail = (url: string) => {
    const id = extractYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  const openAdd = () => {
    setForm(defaultForm);
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setEditingVideo(null);
    setShowAddDialog(true);
  };

  const openEdit = (video: Video) => {
    setForm({
      title: video.title,
      description: video.description,
      categoryId: video.categoryId,
      isYoutube: video.isYoutube,
      youtubeUrl: video.youtubeUrl ?? "",
      featured: video.featured,
      blobId: video.blobId ?? null,
      thumbnailBlobId: video.thumbnailBlobId ?? null,
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setEditingVideo(video);
    setShowAddDialog(true);
  };

  const handleThumbnailChange = (file: File) => {
    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (form.isYoutube && !form.youtubeUrl.trim()) {
      toast.error("YouTube URL is required");
      return;
    }
    if (!form.isYoutube && !videoFile && !editingVideo?.blobId) {
      toast.error("Please select a video file");
      return;
    }

    setIsUploading(true);

    try {
      let blobId = form.blobId;
      let thumbnailBlobId = form.thumbnailBlobId;

      // Upload video file if provided
      if (!form.isYoutube && videoFile) {
        setUploadProgress(0);
        blobId = await upload(videoFile, (pct) => setUploadProgress(pct));
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        thumbnailBlobId = await upload(thumbnailFile);
      }

      const videoData = {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId || "",
        isYoutube: form.isYoutube,
        youtubeUrl: form.isYoutube ? form.youtubeUrl.trim() : null,
        blobId: blobId,
        thumbnailBlobId: thumbnailBlobId,
        featured: form.featured,
        order: BigInt(
          editingVideo ? Number(editingVideo.order) : videos.length,
        ),
      };

      if (editingVideo) {
        await updateVideo.mutateAsync({ id: editingVideo.id, ...videoData });
        toast.success("Video updated");
      } else {
        await createVideo.mutateAsync({
          id: crypto.randomUUID(),
          ...videoData,
        });
        toast.success("Video added");
      }

      setShowAddDialog(false);
    } catch (_err) {
      toast.error("Failed to save video. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo.mutateAsync(id);
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Manage your video portfolio. Add via YouTube link or direct upload.
        </p>
        <Button
          onClick={openAdd}
          className="bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan/20"
          variant="outline"
          data-ocid="videos.add.button"
        >
          <Plus size={14} className="mr-2" />
          Add Video
        </Button>
      </div>

      {videosLoading ? (
        <div className="space-y-3" data-ocid="videos.loading_state">
          {["sk1", "sk2", "sk3", "sk4"].map((id) => (
            <Skeleton key={id} className="h-20 rounded-lg bg-white/5" />
          ))}
        </div>
      ) : sortedVideos.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-white/10 rounded-xl text-muted-foreground"
          data-ocid="videos.empty_state"
        >
          <div className="text-4xl mb-4">🎬</div>
          <p className="font-medium">No videos yet</p>
          <p className="text-sm mt-1">Click "Add Video" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVideos.map((video, i) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
              data-ocid={`videos.item.${i + 1}`}
            >
              {/* Thumbnail */}
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                {video.isYoutube && video.youtubeUrl ? (
                  <img
                    src={getYoutubeThumbnail(video.youtubeUrl) ?? ""}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload size={14} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {video.title}
                  </span>
                  {video.featured && (
                    <Star
                      size={12}
                      className="text-yellow-400 shrink-0"
                      fill="currentColor"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={video.isYoutube ? "default" : "secondary"}
                    className={`text-xs ${video.isYoutube ? "bg-red-500/20 text-red-400 border-red-400/30" : "bg-cyan/20 text-cyan border-cyan/30"} border`}
                  >
                    {video.isYoutube ? (
                      <>
                        <Youtube size={10} className="mr-1" />
                        YouTube
                      </>
                    ) : (
                      <>
                        <Upload size={10} className="mr-1" />
                        Upload
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getCategoryName(video.categoryId)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(video)}
                  className="h-8 w-8 text-muted-foreground hover:text-cyan"
                  data-ocid={`videos.edit_button.${i + 1}`}
                >
                  <Pencil size={14} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      data-ocid={`videos.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="glass-dark border-white/10"
                    data-ocid="videos.dialog"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Delete "{video.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="bg-white/5 border-white/10"
                        data-ocid="videos.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(video.id)}
                        className="bg-destructive text-destructive-foreground"
                        data-ocid="videos.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="glass-dark border-white/10 max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="videos.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg">
              {editingVideo ? "Edit Video" : "Add New Video"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Type toggle */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isYoutube: true }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  form.isYoutube
                    ? "bg-red-500/20 text-red-400 border border-red-400/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="videos.youtube.toggle"
              >
                <Youtube size={16} />
                YouTube Link
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isYoutube: false }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !form.isYoutube
                    ? "bg-cyan/20 text-cyan border border-cyan/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="videos.upload.toggle"
              >
                <Upload size={16} />
                Upload Video
              </button>
            </div>

            {/* YouTube URL or file upload */}
            {form.isYoutube ? (
              <div className="space-y-2">
                <Label className="text-sm text-foreground">YouTube URL</Label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-foreground"
                  data-ocid="videos.youtube_url.input"
                />
                {form.youtubeUrl && extractYoutubeId(form.youtubeUrl) && (
                  <div className="rounded-lg overflow-hidden aspect-video mt-2">
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(form.youtubeUrl)}/maxresdefault.jpg`}
                      alt="YouTube thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Video File</Label>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-cyan/30 transition-colors"
                  data-ocid="videos.dropzone"
                >
                  <Upload
                    size={24}
                    className="mx-auto mb-2 text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    {videoFile ? videoFile.name : "Click to select video file"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    MP4, MOV, AVI up to 500MB
                  </p>
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setVideoFile(file);
                  }}
                />
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-1" data-ocid="videos.loading_state">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Title *</Label>
              <Input
                placeholder="Video title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-foreground"
                data-ocid="videos.title.input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Description</Label>
              <Textarea
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-foreground resize-none"
                rows={2}
                data-ocid="videos.description.textarea"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger
                  className="bg-white/5 border-white/10 text-foreground"
                  data-ocid="videos.category.select"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-white/10">
                  {sortedCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">
                Custom Thumbnail{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <div className="flex gap-3 items-start">
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  className="border border-dashed border-white/20 rounded-lg p-3 text-center cursor-pointer hover:border-cyan/30 transition-colors flex-1"
                  data-ocid="videos.thumbnail.dropzone"
                >
                  <Image
                    size={16}
                    className="mx-auto mb-1 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    {thumbnailFile
                      ? thumbnailFile.name
                      : "Click to upload thumbnail"}
                  </p>
                </button>
                {(thumbnailPreview || (form.isYoutube && form.youtubeUrl)) && (
                  <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={
                        thumbnailPreview ??
                        (form.isYoutube && form.youtubeUrl
                          ? `https://img.youtube.com/vi/${extractYoutubeId(form.youtubeUrl)}/mqdefault.jpg`
                          : "")
                      }
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailChange(file);
                }}
                data-ocid="videos.thumbnail.upload_button"
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-medium text-foreground">Featured</p>
                <p className="text-xs text-muted-foreground">
                  Show a featured badge on this video
                </p>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                data-ocid="videos.featured.switch"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAddDialog(false)}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="videos.cancel_button"
            >
              <X size={14} className="mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isUploading || createVideo.isPending || updateVideo.isPending
              }
              className="bg-cyan text-navy-deep hover:bg-cyan/90 font-semibold"
              data-ocid="videos.submit_button"
            >
              {isUploading || createVideo.isPending || updateVideo.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  {isUploading ? `Uploading ${uploadProgress}%` : "Saving..."}
                </>
              ) : editingVideo ? (
                "Update Video"
              ) : (
                "Add Video"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
