import { Notification, PaginationMeta, UnreadCount } from "@/types";
import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      { items: Notification[], meta: PaginationMeta },
      { page: number; limit: number }
    >({
      query: (params) => ({
        url: "/api/v1/notifications",
        method: "GET",
        params,
      }),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<UnreadCount, void>({
      query: () => ({
        url: "/api/v1/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    registerDeviceToken: builder.mutation<
      any,
      { expoToken: string; fcmToken: string; deviceType: string }
    >({
      query: (data) => ({
        url: `/api/v1/notifications/tokens`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUnreadCountQuery,
  useRegisterDeviceTokenMutation,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;
