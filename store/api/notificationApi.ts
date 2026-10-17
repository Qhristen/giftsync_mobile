import { Notification, PaginationMeta, UnreadCount } from "@/types";
import { baseApi } from "./baseApi";
import { getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from "./optimistic";

type NotificationQueryArgs = { page: number; limit: number };

const patchNotificationLists = (
  dispatch: any,
  getState: () => unknown,
  recipe: (draft: { items: Notification[]; meta: PaginationMeta }) => void,
) => getCachedQueryArgs<NotificationQueryArgs>(getState(), "getNotifications").map((args) =>
  dispatch(notificationApi.util.updateQueryData("getNotifications", args, recipe)),
);

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
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        let changed = false;
        const patches: OptimisticPatch[] = patchNotificationLists(dispatch, getState, (draft) => {
          const notification = draft.items.find((item) => item.id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            changed = true;
          }
        });
        if (changed) {
          patches.push(dispatch(
            notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
              draft.count = Math.max(0, draft.count - 1);
            }),
          ));
        }

        try {
          await queryFulfilled;
        } catch {
          undoOptimisticPatches(patches);
        }
      },
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        const patches: OptimisticPatch[] = patchNotificationLists(dispatch, getState, (draft) => {
          draft.items.forEach((notification) => { notification.isRead = true; });
        });
        patches.push(dispatch(
          notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            draft.count = 0;
          }),
        ));

        try {
          await queryFulfilled;
        } catch {
          undoOptimisticPatches(patches);
        }
      },
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        let removedUnread = false;
        const patches: OptimisticPatch[] = patchNotificationLists(dispatch, getState, (draft) => {
          const index = draft.items.findIndex((item) => item.id === id);
          if (index === -1) return;
          removedUnread ||= !draft.items[index].isRead;
          draft.items.splice(index, 1);
          draft.meta.total = Math.max(0, draft.meta.total - 1);
        });
        if (removedUnread) {
          patches.push(dispatch(
            notificationApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
              draft.count = Math.max(0, draft.count - 1);
            }),
          ));
        }

        try {
          await queryFulfilled;
        } catch {
          undoOptimisticPatches(patches);
        }
      },
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
