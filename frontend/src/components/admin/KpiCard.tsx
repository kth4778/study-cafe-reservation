import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'orange' | 'green' | 'red' | 'blue' | 'purple';
  sub?: string;
}

const COLOR = {
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100', bar: 'var(--kiosk-orange)' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100',  bar: '#16A34A' },
  red:    { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100',    bar: '#EF4444' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   bar: '#2563EB' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', bar: '#7C3AED' },
};

export const KpiCard = ({ label, value, icon, color = 'orange', sub }: KpiCardProps) => {
  const c = COLOR[color];
  return (
    <div className={`ad-card p-5 flex items-center gap-4 border-l-4`} style={{ borderLeftColor: c.bar }}>
      <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center flex-shrink-0`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};
