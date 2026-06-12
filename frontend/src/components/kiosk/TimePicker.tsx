import { TIME_OPTIONS_HOURS } from '@/constants/config';
import { formatKrw } from '@/utils/time';

interface TimePickerProps {
  pricePerHour: number;
  selectedHours: number;
  onSelect: (hours: number) => void;
}

export const TimePicker = ({ pricePerHour, selectedHours, onSelect }: TimePickerProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TIME_OPTIONS_HOURS.map((hours) => {
        const isSelected = selectedHours === hours;
        const total = pricePerHour * hours;
        return (
          <button
            key={hours}
            onClick={() => onSelect(hours)}
            className={`flex flex-col items-center justify-center rounded-2xl py-5 px-4 transition-all duration-150 border-2 ${
              isSelected
                ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/30 scale-[1.03]'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
            }`}
          >
            <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {hours}시간
            </span>
            <span className={`text-sm mt-1 font-semibold ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
              {formatKrw(total)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
