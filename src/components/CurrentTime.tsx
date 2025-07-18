import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { getSimulatedTime, formatTime } from "../utils/timeUtils";

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(getSimulatedTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getSimulatedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []); // baseTime, appStartTime 의존성 제거

  return (
    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
      <Clock className="h-5 w-5 text-blue-600" />
      <span className="text-lg font-semibold text-gray-800">
        {formatTime(currentTime)}
      </span>
    </div>
  );
};

export default CurrentTime;