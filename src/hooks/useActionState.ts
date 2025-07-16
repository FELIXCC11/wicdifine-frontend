// src/libs/hooks/useActionState.ts
'use client';

import { useCallback, useRef, useState, useTransition } from 'react';

export function useActionState<State, Payload = void>(
  action: (state: State, payload: Payload) => Promise<State>,
  initialState: State
): [State, (payload: Payload) => void] {
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();
  const pendingStateRef = useRef<State | null>(null);

  const dispatch = useCallback(
    (payload: Payload) => {
      startTransition(async () => {
        try {
          // Store the result in ref first to avoid race conditions
          pendingStateRef.current = await action(state, payload);
          setState(pendingStateRef.current);
        } catch (error) {
          console.error('Action failed:', error);
        }
      });
    },
    [action, state]
  );

  return [state, dispatch];
}