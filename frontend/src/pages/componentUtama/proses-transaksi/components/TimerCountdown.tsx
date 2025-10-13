import { Clock } from "lucide-react";

interface TimerCountdownProps {
  timeLeft: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimerCountdown: React.FC<TimerCountdownProps> = ({ timeLeft }) => {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-700">Batas waktu pembayaran:</span>
        </div>
        <div className={`text-xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-yellow-600'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};

export default TimerCountdown;