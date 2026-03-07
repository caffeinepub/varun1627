import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: VideoId;
    categoryId: CategoryId;
    title: string;
    featured: boolean;
    order: bigint;
    thumbnailBlobId?: string;
    createdAt: bigint;
    description: string;
    blobId?: string;
    isYoutube: boolean;
    youtubeUrl?: string;
}
export type SiteContentKey = string;
export interface Category {
    id: CategoryId;
    order: bigint;
    name: string;
    createdAt: bigint;
}
export type VideoId = string;
export type CategoryId = string;
export interface SiteContent {
    key: SiteContentKey;
    value: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Category CRUD (Admin-only Write)
     */
    createCategory(id: string, name: string, order: bigint): Promise<void>;
    /**
     * / Video CRUD (Admin-only Write)
     */
    createVideo(id: string, title: string, description: string, categoryId: string, isYoutube: boolean, youtubeUrl: string | null, blobId: string | null, thumbnailBlobId: string | null, featured: boolean, order: bigint): Promise<void>;
    deleteCategory(id: string): Promise<void>;
    deleteVideo(id: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllSiteContent(): Promise<Array<SiteContent>>;
    getAllVideos(): Promise<Array<Video>>;
    /**
     * / User Profile Management
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(id: string): Promise<Category | null>;
    getSiteContent(key: string): Promise<SiteContent | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: string): Promise<Video | null>;
    getVideosByCategory(categoryId: string): Promise<Array<Video>>;
    /**
     * / Init with Default Data
     */
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Site Content CRUD (Admin-only Write)
     */
    setSiteContent(key: string, value: string): Promise<void>;
    updateCategory(id: string, name: string, order: bigint): Promise<void>;
    updateVideo(id: string, title: string, description: string, categoryId: string, isYoutube: boolean, youtubeUrl: string | null, blobId: string | null, thumbnailBlobId: string | null, featured: boolean, order: bigint): Promise<void>;
}
