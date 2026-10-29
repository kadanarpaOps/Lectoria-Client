import { addToFavoritesRequest, deleteStoryCoverRequest, deleteStoryRequest, getAllGenresRequest, getAuthUserSavedStoriesRequest, getAuthUserStoriesRequest, getLastModifiedStoryRequest, getStoriesRequest, getStoryByIdRequest, pageTagsRequest, registerStoryRequest, removeFromFavoritesRequest, toggleStoryHiddenRequest, updateStoryCoverRequest, updateStoryRequest, updateStoryTags, verifyFromFavoritesRequest } from "../../../infrastructure/api/requests/stories/stories.request";
import type { PageResponse } from "../../domain/models/common/PaginationModels";
import type { BasicInfo, LastModifiedStory, RegisterStory, StoryInfo, UpdateStory, StoryFilters } from "../../domain/models/stories/StoryModel";
import type { StoryPort } from "../../domain/ports/stories/StoriesPort";

export class StoryService implements StoryPort {
    async getAllGenres(): Promise<BasicInfo[]> {
        const allGenres = await getAllGenresRequest();
        return allGenres;
    }

    async pageTags(offset: number, limit: number, tagName: string): Promise<PageResponse<BasicInfo>> {
        const pagedTags = await pageTagsRequest(offset, limit, tagName);
        return pagedTags;
    }

    async getStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>> {
        const pagedStories = await getStoriesRequest(filters);
        return pagedStories;
    }

    async getAuthUserStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>> {
        const pagedStories = await getAuthUserStoriesRequest(filters);
        return pagedStories;
    }

    async getAuthUserSavedStories(filters: StoryFilters): Promise<PageResponse<StoryInfo>> {
        const pagedStories = await getAuthUserSavedStoriesRequest(filters);
        return pagedStories;
    }

    async getStoryById(storyId: string): Promise<StoryInfo> {
        const story = await getStoryByIdRequest(storyId);
        return story;
    }

    async getLastModifiedStory(): Promise<LastModifiedStory> {
        const story = await getLastModifiedStoryRequest();
        return story;
    }

    async registerStory(story: RegisterStory): Promise<void> {
        const response = await registerStoryRequest(story);
        return response;
    }

    async updateStory(story: UpdateStory, storyId: string): Promise<void> {
        const response = await updateStoryRequest(story, storyId);
        return response;
    }

    async toggleStoryHidden(storyId: string): Promise<void> {
        const response = await toggleStoryHiddenRequest(storyId);
        return response;
    }

    async deleteStory(storyId: string): Promise<void> {
        const response = await deleteStoryRequest(storyId);
        return response;
    }

    async updateStoryCover(image: File, storyId: string): Promise<void> {
        const response = await updateStoryCoverRequest(image, storyId);
        return response;
    }

    async deleteStoryCover(storyId: string): Promise<void> {
        const response = await deleteStoryCoverRequest(storyId);
        return response;
    }

    async updateStoryTags(tagNames: string[], storyId: string): Promise<void> {
        const response = await updateStoryTags(tagNames, storyId);
        return response;
    }

    // Favorites

    async addToFavorites(storyId: string): Promise<void> {
        const response = await addToFavoritesRequest(storyId);
        return response;
    }

    async removeFromFavorites(storyId: string): Promise<void> {
        const response = await removeFromFavoritesRequest(storyId);
        return response;
    }

    async existsFromFavorites(storyId: string): Promise<boolean> {
        const response = await verifyFromFavoritesRequest(storyId);
        return response;
    }

}
