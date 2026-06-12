import { WifiOff } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';

export const OfflineBanner = () => {
  const isOnline = useNetworkStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-600 py-3 px-4 text-white font-semibold text-sm shadow-lg animate-pulse">
      <WifiOff size={18} />
      <span>네트워크 연결이 끊어졌습니다. 현금 결제만 가능합니다.</span>
    </div>
  );
};
