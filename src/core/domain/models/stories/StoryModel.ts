import type { ChapterInfo } from "../chapters/ChapterModel";

export const statusNames = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
    PAUSED: "PAUSED",
} as const

export type StatusNames = typeof statusNames[keyof typeof statusNames];

export interface BasicInfo {
    id: string;
    name: string;
}

export interface StoryInfo {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    hidden: boolean;
    genre: BasicInfo;
    secondaryGenre: BasicInfo;
    tags: BasicInfo[];
    userId: string;
    // Average Rating
    totalRating: number;
    // User that has Rated
    ratingCount: number;
    ratingSum: number;
    totalChapters: number;
    totalViews: number;
    totalFavorites: number;
    status: StatusNames;
    createdAt: Date;
    updatedAt: Date;
}

export interface LastModifiedStory extends StoryInfo {
    chapters: ChapterInfo[];
}

export interface RegisterStory {
    title: string;
    description: string;
    genreName: string;
    secondaryGenreName: string;
    tagNames: string [] | null;
    image: File | null;
}

export interface UpdateStory {
    title: string;
    description: string;
    genreName: string;
    secondaryGenreName: string;
    status: StatusNames;
}

export interface StoryFilters {
    offset: number;
    limit: number;
    title?: string;
    genreName?: string;
    secondaryGenreName?: string;
    status?: StatusNames;
    tagNames?: string[];
    newestFirst?: boolean;
}

export interface UpdateTags {
    tagNames: string[];
}
