import type { PageResponse } from "../../../../core/domain/models/common/PaginationModels";
import type { ChapterInfo, ChaptersFilters, RegisterChapter, UpdateChapter } from "../../../../core/domain/models/chapters/ChapterModel";
import { storyClient } from "../../config/axios.instance";

export const getChaptersByStoryRequest = async (filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>> => {
  const response = await storyClient.get(`api/chapter/${storyId}`, {
    params: filters,
  });
  return response.data;
}

export const getOwnedChaptersByStoryRequest = async (filters: ChaptersFilters, storyId: string): Promise<PageResponse<ChapterInfo>> => {
  const response = await storyClient.get(`api/chapter/my-chapters/${storyId}`, {
    params: filters,
  });
  return response.data;
}

export const getChapterById = async (chapterId: string): Promise<ChapterInfo> => {
  const response = await storyClient.get(`api/chapter/id/${chapterId}`);
  return response.data;
}

export const createChapterRequest = async (createChapter: RegisterChapter): Promise<void> => {
  const response = await storyClient.post(`api/chapter/create`, createChapter);
  return response.data;
}

export const toggleChapterStatusRequest = async (chapterId: string): Promise<void> => {
  const response = await storyClient.patch(`api/chapter/toggle-hidden/${chapterId}`);
  return response.data;
}

export const deleteChapterRequest = async (storyId: string, chapterId: string): Promise<void> => {
  const response = await storyClient.delete(`api/chapter/${storyId}/chapter/${chapterId}`);
  return response.data;
}

export const updateChapterRequest = async (chapterId: string, updateChapter: UpdateChapter): Promise<void> => {
  const response = await storyClient.patch(`api/chapter/update/${chapterId}`, updateChapter);
  return response.data;
}
