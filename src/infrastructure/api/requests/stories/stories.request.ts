import type { PageResponse } from '../../../../core/domain/models/common/PaginationModels';
import type { BasicInfo, LastModifiedStory, RegisterStory, StoryInfo, UpdateStory, StoryFilters } from '../../../../core/domain/models/stories/StoryModel';
import { storyClient } from '../../config/axios.instance';

export const getAllGenresRequest = async (): Promise<BasicInfo[]> => {
    const response = await storyClient.get(`api/genre`);
    return response.data;
}

export const pageTagsRequest = async (offset: number, limit: number, tagName: string): Promise<PageResponse<BasicInfo>> => {
    const response = await storyClient.get(`api/tag/search`, {
        params: { offset, limit, tagName }
    });
    return response.data;
}

export const getStoriesRequest = async (filters: StoryFilters) : Promise<PageResponse<StoryInfo>> => {
    const response = await storyClient.get(`api/story/search`, {
        params: filters
    });
    return response.data;
}

export const getAuthUserStoriesRequest = async (filters: StoryFilters, userId: string): Promise<PageResponse<StoryInfo>> => {
    const response = await storyClient.get(`api/story/search/${userId}`, {
        params: filters
    });
    return response.data;
}

export const getAuthUserSavedStoriesRequest = async (filters: StoryFilters, userId: string): Promise<PageResponse<StoryInfo>> => {
    const response = await storyClient.get(`api/favorite/search/${userId}`, {
        params: filters
    });

    if(response.data.stories) {
        return {
            data: response.data.stories,
            meta: response.data.meta  
        }
    }
    
    return response.data;
}

export const getStoryByIdRequest = async (storyId: string): Promise<StoryInfo> => {
    const response = await storyClient.get(`api/story/id/${storyId}`);
    return response.data;
}

export const getLastModifiedStoryRequest = async (userId: string): Promise<LastModifiedStory> => {
    const response = await storyClient.get(`api/story/last-modified/${userId}`);
    return response.data;
}

export const registerStoryRequest = async (story: RegisterStory): Promise<void> => {
    const response = await storyClient.post(`api/story/create`, story, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

export const updateStoryRequest = async (story: UpdateStory, storyId: string): Promise<void> => {
    const response = await storyClient.put(`api/story/update/${storyId}`, story);
    return response.data;
}

export const toggleStoryHiddenRequest = async (storyId: string): Promise<void> => {
    const response = await storyClient.patch(`api/story/toggle-hidden/${storyId}`);
    return response.data;
}

export const deleteStoryRequest = async (storyId: string): Promise<void> => {
    const response = await storyClient.delete(`api/story/delete/${storyId}`);
    return response.data;
}

export const updateStoryCoverRequest = async (image: File, storyId: string): Promise<void> => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await storyClient.patch(`api/story/cover/${storyId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

export const deleteStoryCoverRequest = async (storyId: string): Promise<void> => {
    const response = await storyClient.delete(`api/story/cover/${storyId}`);
    return response.data;
}

export const updateStoryTags = async (tagNames: string[], storyId: string): Promise<void> => {
    const response = await storyClient.put(`api/story/update/${storyId}/tags`, {
        tagNames
    });
    return response.data;
}

// Favorites
export const addToFavoritesRequest = async (userId: string, storyId: string): Promise<void> => {
    const response = await storyClient.post(`api/favorite/add`, {
        userId: userId,
        storyId: storyId
    });
    return response.data;
}

export const removeFromFavoritesRequest = async (userId: string, storyId: string): Promise<void> => {
    const response = await storyClient.delete(`api/favorite/remove/${userId}/story/${storyId}`);
    return response.data;
}

export const verifyFromFavoritesRequest = async (userId: string, storyId: string): Promise<void> => {
    const response = await storyClient.get(`api/favorite/exists/${userId}/story/${storyId}`);
    return response.data.data;
}
