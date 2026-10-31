import { createContext } from "react";
import type { BasicInfo, LastModifiedStory, RegisterStory, StoryFilters, StoryInfo, UpdateStory  } from "../../core/domain/models/stories/StoryModel";
import type { PageResponse } from "../../core/domain/models/common/PaginationModels";

export interface StoriesContextType {
    // Basics
    loading: boolean;
    error: string | null;
    // Genres
    genres: BasicInfo[];
    genresLoaded: boolean;
    genresLoading: boolean;
    genresError: string | null;
    loadGenres: () => Promise<void>;
    // Rest Methods
    pageTags: (offset: number, limit: number, tagName: string) => Promise<PageResponse<BasicInfo>>
    createStory: (story: RegisterStory) => Promise<boolean>;
    updateStory: (story: UpdateStory, storyId: string) => Promise<boolean>;
    updateStoryCover: (file: File, storyId: string) => Promise<boolean>;
    deleteStoryCover: (storyId: string) => Promise<boolean>;
    toggleStoryStatus: (storyId: string) => Promise<boolean>;
    loadStoriesForAuthUser: (filters: StoryFilters) => Promise<PageResponse<StoryInfo>>;
    loadStoryById: (storyId: string) => Promise<StoryInfo>;
    loadPublishedStories: (filters: StoryFilters) => Promise<PageResponse<StoryInfo>>; //Acabar de implementar estos 3 load en el context, hacer un useSearch y hacer la página de Explore dinámica pa que llene esos filters :p
    loadLastModifiedStoryForAuthUser: () => Promise<LastModifiedStory>;
    loadAuthUserFavorites: (filters: StoryFilters) => Promise<PageResponse<StoryInfo>>;
    // Favorites
    addToFavorites: (storyId: string) => Promise<boolean>;
    removeFromFavorites: (storyId: string) => Promise<boolean>;
    existsFromFavorites: (storyId: string) => Promise<boolean>;
}

export const StoriesContext = createContext<StoriesContextType | null>(null);
