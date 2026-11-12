import httpClient from "../config/axios.instance";

export type AppNotification = {
  notificationId: string;
  notificationContent: string;
  shown: boolean;
  createdAt: string;
  shownAt: string | null;
};

export type NotificationPage = {
  content: AppNotification[];
  number: number;
  totalPages: number;
  totalElements: number;
};

export const getAppNotifications = async (page = 0, pageSize = 20) => {
  const response = await httpClient.get<NotificationPage>("notifications/in-app", { params: { page, pageSize } });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await httpClient.get<number>("notifications/in-app/unread-count");
  return response.data;
};

export const setAppNotificationReadState = async (id: string, read: boolean) => {
  await httpClient.patch(`notifications/in-app/${id}/${read ? "read" : "unread"}`);
};
