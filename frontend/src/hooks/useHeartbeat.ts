import { useEffect, useRef } from 'react';
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_FAIL_LIMIT, API_BASE_URL } from '@/constants/config';
import { useNetworkStore } from '@/store/networkStore';

export const useHeartbeat = () => {
  const setOnline = useNetworkStore((s) => s.setOnline);
  const failCountRef = useRef(0);

  useEffect(() => {
    const check = async () => {
      try {
        await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
        failCountRef.current = 0;
        setOnline(true);
      } catch {
        failCountRef.current += 1;
        if (failCountRef.current >= HEARTBEAT_FAIL_LIMIT) {
          setOnline(false);
        }
      }
    };

    check();
    const id = setInterval(check, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [setOnline]);
};
