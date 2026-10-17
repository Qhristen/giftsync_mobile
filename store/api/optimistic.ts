type ApiQueryEntry = {
    endpointName?: string;
    originalArgs?: unknown;
};

type ApiState = {
    api?: {
        queries?: Record<string, ApiQueryEntry | undefined>;
    };
};

export type OptimisticPatch = { undo: () => void };

/**
 * Return the arguments for every mounted/cached instance of an endpoint.
 * This keeps optimistic writes in sync across filters and paginated screens.
 */
export const getCachedQueryArgs = <TArgs>(state: unknown, endpointName: string): TArgs[] => {
    const queries = (state as ApiState).api?.queries ?? {};

    return Object.values(queries)
        .filter((entry): entry is ApiQueryEntry => entry?.endpointName === endpointName)
        .map((entry) => entry.originalArgs as TArgs);
};

export const undoOptimisticPatches = (patches: OptimisticPatch[]) => {
    for (let index = patches.length - 1; index >= 0; index -= 1) {
        patches[index].undo();
    }
};

export const createOptimisticId = (prefix: string) =>
    `optimistic-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
