import { BlockedUser, Conversation, CreateReportDto } from '@/types';
import { baseApi } from './baseApi';
import { chatApi } from './chatApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

export const trustSafetyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        blockUser: builder.mutation<void, { blockedId: string }>({
            query: (data) => ({
                url: '/api/v1/trust-safety/block',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['TrustSafety'],
            async onQueryStarted({ blockedId }, { dispatch, getState, queryFulfilled }) {
                const conversationArgs = getCachedQueryArgs<{ page?: number; limit?: number }>(getState(), 'getConversations');
                let blockedUser: BlockedUser['blocked'] | undefined;
                for (const args of conversationArgs) {
                    const conversations = chatApi.endpoints.getConversations.select(args)(getState() as any).data?.items ?? [];
                    blockedUser = conversations
                        .flatMap((conversation: Conversation) => conversation.participants)
                        .find((participant) => participant.id === blockedId);
                    if (blockedUser) break;
                }

                const patches: OptimisticPatch[] = conversationArgs.map((args) => dispatch(
                    chatApi.util.updateQueryData('getConversations', args, (draft) => {
                        const previousLength = draft.items.length;
                        draft.items = draft.items.filter((conversation) =>
                            !conversation.participants.some((participant) => participant.id === blockedId),
                        );
                        draft.meta.total = Math.max(0, draft.meta.total - (previousLength - draft.items.length));
                    }),
                ));
                if (blockedUser) {
                    patches.push(dispatch(
                        trustSafetyApi.util.updateQueryData('getBlockedUsers', undefined, (draft) => {
                            if (draft.some((entry) => entry.blockedId === blockedId)) return;
                            draft.unshift({
                                id: createOptimisticId('block'),
                                blockedId,
                                blocked: blockedUser!,
                                createdAt: new Date().toISOString(),
                            });
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
        unblockUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/trust-safety/block/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TrustSafety'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    trustSafetyApi.util.updateQueryData('getBlockedUsers', undefined, (draft) => {
                        const index = draft.findIndex((entry) => entry.id === id || entry.blockedId === id);
                        if (index !== -1) draft.splice(index, 1);
                    }),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
        getBlockedUsers: builder.query<BlockedUser[], void>({
            query: () => ({
                url: '/api/v1/trust-safety/block',
                method: 'GET',
            }),
            providesTags: ['TrustSafety'],
        }),
        submitReport: builder.mutation<void, CreateReportDto>({
            query: (data) => ({
                url: '/api/v1/trust-safety/report',
                method: 'POST',
                data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useBlockUserMutation,
    useUnblockUserMutation,
    useGetBlockedUsersQuery,
    useSubmitReportMutation,
} = trustSafetyApi;
