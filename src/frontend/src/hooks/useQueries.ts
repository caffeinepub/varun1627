import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, SiteContent, Video } from "../backend.d";
import { useActor } from "./useActor";

// ── Site Content ──────────────────────────────────────────────────────────────

export function useSiteContent() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteContent[]>({
    queryKey: ["siteContent"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSiteContent();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSiteContentMap() {
  const { data: contents = [] } = useSiteContent();
  const map: Record<string, string> = {};
  for (const item of contents) {
    map[item.key] = item.value;
  }
  return map;
}

export function useSetSiteContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setSiteContent(key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
    },
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      order,
    }: {
      id: string;
      name: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createCategory(id, name, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      order,
    }: {
      id: string;
      name: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateCategory(id, name, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ── Videos ────────────────────────────────────────────────────────────────────

export function useVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: {
      id: string;
      title: string;
      description: string;
      categoryId: string;
      isYoutube: boolean;
      youtubeUrl: string | null;
      blobId: string | null;
      thumbnailBlobId: string | null;
      featured: boolean;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createVideo(
        video.id,
        video.title,
        video.description,
        video.categoryId,
        video.isYoutube,
        video.youtubeUrl,
        video.blobId,
        video.thumbnailBlobId,
        video.featured,
        video.order,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: {
      id: string;
      title: string;
      description: string;
      categoryId: string;
      isYoutube: boolean;
      youtubeUrl: string | null;
      blobId: string | null;
      thumbnailBlobId: string | null;
      featured: boolean;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateVideo(
        video.id,
        video.title,
        video.description,
        video.categoryId,
        video.isYoutube,
        video.youtubeUrl,
        video.blobId,
        video.thumbnailBlobId,
        video.featured,
        video.order,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ── Admin check ───────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ── Initialize ────────────────────────────────────────────────────────────────

export function useInitialize() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
