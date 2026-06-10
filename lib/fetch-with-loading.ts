export type FetchWithLoadingInit = RequestInit & { important?: boolean };

export async function fetchWithLoading(
    input: RequestInfo,
    init?: FetchWithLoadingInit,
    controller?: { startLoading: () => void; stopLoading: () => void },
): Promise<Response> {
    const important = init?.important ?? true;

    if (important && controller) {
        controller.startLoading();
    }

    try {
        const safeInit = { ...init } as RequestInit;
        if (safeInit && "important" in safeInit) {
            delete (safeInit as FetchWithLoadingInit).important;
        }
        return await fetch(input, safeInit);
    } finally {
        if (important && controller) {
            controller.stopLoading();
        }
    }
}
