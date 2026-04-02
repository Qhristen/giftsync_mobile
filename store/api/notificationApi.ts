import { Notification, UnreadCount } from "@/types";
import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      Notification[],
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
        body: data,
      }),
      invalidatesTags: ["Products" as any],
    }),
  }),
  overrideExisting: true,
});

export const { useGetUnreadCountQuery, useRegisterDeviceTokenMutation } = notificationApi;
