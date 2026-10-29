import type { PageResponse } from "../../models/common/PaginationModels";
import type { BasicInfo, LastModifiedStory, RegisterStory, StoryFilters, StoryInfo, UpdateStory } from "../../models/stories/StoryModel";

export interface StoryPort {
    getAllGenres(): Promise<BasicInfo[]>;
    pageTags(offset: number, limit: number, tagName: string): Promise<PageResponse<BasicInfo>>;
    getStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>>;
    getAuthUserStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>>;
    getAuthUserSavedStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>>;
    getStoryById(storyId: string): Promise<StoryInfo>;
    getLastModifiedStory(): Promise<LastModifiedStory>;
    registerStory(story: RegisterStory): Promise<void>
    updateStory(story: UpdateStory, storyId: string): Promise<void>;
    toggleStoryHidden(storyId: string): Promise<void>;
    deleteStory(storyId: string): Promise<void>;
    updateStoryCover(image: File, storyId: string): Promise<void>;
    deleteStoryCover(storyId: string): Promise<void>;
    updateStoryTags(tagNames: string[], storyId: string ): Promise<void>;
    //Favorites
    addToFavorites(storyId: string): Promise<void>;
    removeFromFavorites(storyId: string): Promise<void>;
    existsFromFavorites(storyId: string): Promise<boolean>;
}
