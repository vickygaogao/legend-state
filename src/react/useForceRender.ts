import { useCallback, useReducer } from 'react';

export function useForceRender() {
    const [, forceRender] = useReducer((s) => s + 1, 0);
    return useCallback(() => forceRender(), []);
}
