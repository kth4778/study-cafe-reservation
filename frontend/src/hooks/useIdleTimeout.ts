import { useEffect, useCallback, useRef } from 'react';
import { IDLE_TIMEOUT_MS } from '@/constants/config';

export const useIdleTimeout = (onTimeout: () => void, enabled = true) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, IDLE_TIMEOUT_MS);
  }, [onTimeout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['touchstart', 'touchend', 'click', 'mousemove', 'keydown'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset, enabled]);
};
