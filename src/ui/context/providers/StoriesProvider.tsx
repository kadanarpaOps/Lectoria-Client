import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StoryService } from "../../../core/use-cases/stories/StoryUseCases";
import type { BasicInfo, LastModifiedStory, RegisterStory, StoryInfo, UpdateStory, StoryFilters } from "../../../core/domain/models/stories/StoryModel";
import executeTask from "../utils/TaskExecutor";
import { StoriesContext, type StoriesContextType } from "../StoriesContext";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import { useAlert } from "../../hooks/useAlert";

type Props = {
    children: ReactNode;
}

const storiesService = new StoryService();

function StoriesProvider({ children }: Props) {
    // Alert Component
    const { showAlert } = useAlert();
    // Basics
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Genres
    const [genres, setGenres] = useState<BasicInfo[] | null>(null);

    // Business Methods
    const pageTags = async (offset: number, limit: number, tagName: string) => {
        const response = await executeTask(() => storiesService.pageTags(offset, limit, tagName), setLoading, setError);
        return response as PageResponse<BasicInfo>;
    };

    const createStory = async (storyData: RegisterStory): Promise<boolean> => {
        const response = await executeTask(() => storiesService.registerStory(storyData), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    };

    const updateStory = async (storyData: UpdateStory, storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.updateStory(storyData, storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    }

    const updateStoryCover = async (file: File, storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.updateStoryCover(file, storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    };

    const deleteStoryCover = async (storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.deleteStoryCover(storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    };

    const toggleStoryStatus = async (storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.toggleStoryHidden(storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    }

    const loadStoriesForAuthUser = useCallback(async (filters: StoryFilters) => {
        const response = await executeTask(() => storiesService.getAuthUserStories(filters), setLoading, setError) as PageResponse<StoryInfo>;
        return response;
    }, []);

    const loadStoryById = useCallback(async (storyId: string) => {
        const response = await executeTask(() => storiesService.getStoryById(storyId), setLoading, setError) as StoryInfo;
        return response;
    }, []);

    const loadPublishedStories = useCallback(async (filters: StoryFilters): Promise<PageResponse<StoryInfo>> => {
        const response = await executeTask(() => storiesService.getStories(filters), setLoading, setError) as PageResponse<StoryInfo>;
        return response;
    }, []);

    const loadLastModifiedStoryForAuthUser = useCallback(async () => {
        const response = await executeTask(() => storiesService.getLastModifiedStory(), setLoading, setError) as LastModifiedStory;
        return response;
    }, []);

    const loadAuthUserFavorites = useCallback(async (filters: StoryFilters): Promise<PageResponse<StoryInfo>> => {
        const response = await executeTask(() => storiesService.getAuthUserSavedStories(filters), setLoading, setError) as PageResponse<StoryInfo>;
        return response;
    }, []);

    // Favorites

    const addToFavorites = async (storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.addToFavorites(storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    }

    const removeFromFavorites = async (storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.removeFromFavorites(storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    }

    const existsFromFavorites = useCallback(async (storyId: string): Promise<boolean> => {
        const response = await executeTask(() => storiesService.existsFromFavorites(storyId), setLoading, setError, showAlert, true);
        if (!response) return false;
        return true;
    }, [showAlert]);

    /** useEffects */
    // Load all Genres
    useEffect(() => {
        const loadAllGenres = async () => {
            const response = await executeTask(() => storiesService.getAllGenres(), setLoading, setError);
            setGenres(response);
        }
        loadAllGenres();
    }, []);

    // Export Values
    const exportValues: StoriesContextType = {
        loading,
        error,
        genres,
        createStory,
        updateStory,
        updateStoryCover,
        deleteStoryCover,
        toggleStoryStatus,
        pageTags,
        loadStoriesForAuthUser,
        loadStoryById,
        loadPublishedStories,
        loadLastModifiedStoryForAuthUser,
        loadAuthUserFavorites,
        // Favorites
        addToFavorites,
        removeFromFavorites,
        existsFromFavorites
    }

    return (
        <StoriesContext.Provider value={exportValues}>{children}</StoriesContext.Provider>
    )

}

export default StoriesProvider;
