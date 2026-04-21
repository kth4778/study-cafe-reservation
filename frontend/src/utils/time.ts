export const formatTime = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' });
};

export const getRemainingMinutes = (endTime: string): number => {
  return Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 60_000));
};

export const formatKrw = (amount: number): string =>
  amount.toLocaleString('ko-KR') + '원';

export const formatDuration = (hours: number): string =>
  hours === 1 ? '1시간' : `${hours}시간`;

export const formatDateTime = (isoString: string): string => {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
};
