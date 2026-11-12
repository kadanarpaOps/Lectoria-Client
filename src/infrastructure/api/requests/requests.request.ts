import httpClient from "../config/axios.instance";
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel";

export type UserRequest = {
  id: string;
  type: "COAUTHOR_REQUEST" | "REACTIVATE_ACCOUNT";
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  sourceUserId: string;
  targetUserId: string | null;
  storyId: string | null;
  coauthorUserId: string | null;
  createdAt: string;
  sourceUsername?: string | null;
  targetUsername?: string | null;
  coauthorUsername?: string | null;
};

export type Coauthor = { id: string; storyId: string; userId: string; username: string; createdAt: string };

export const getMyRequests = async () => (await httpClient.get<UserRequest[]>("requests")).data;
export const createCoauthorRequest = async (storyId: string) => httpClient.post(`requests/coauthor/${storyId}`);
export const inviteCoauthor = async (storyId: string, username: string) =>
  httpClient.post(`requests/coauthor/${storyId}/invite`, { username });
export const respondToRequest = async (id: string, accept: boolean) =>
  httpClient.post(`requests/${id}/${accept ? "accept" : "reject"}`);
export const getStoryCoauthors = async (storyId: string) =>
  (await httpClient.get<Coauthor[]>(`requests/coauthor/${storyId}`)).data;
export const removeStoryCoauthor = async (storyId: string, userId: string) =>
  httpClient.delete(`requests/coauthor/${storyId}/${userId}`);
export const getCoauthoredStories = async () =>
  (await httpClient.get<StoryInfo[]>("requests/coauthor/stories")).data;
export const acquireChapterLock = async (chapterId: string) =>
  httpClient.post(`requests/chapters/${chapterId}/lock`);
export const releaseChapterLock = async (chapterId: string) =>
  httpClient.delete(`requests/chapters/${chapterId}/lock`);
export const getPendingReactivationRequests = async () =>
  (await httpClient.get<AdminReactivationRequest[]>("requests/admin/reactivations")).data;
export const beginAccountReactivation = async (requestId: string) =>
  httpClient.post(`requests/admin/reactivations/${requestId}/start`);
export const requestAccountReactivation = async (identity: { username?: string; userEmail?: string }) =>
  (await httpClient.post<UserRequest>("requests/reactivate", identity)).data;

export type AdminReactivationRequest = { id: string; username: string; userEmail: string; createdAt: string };
