import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getSettings } from '../utils/localStorage';

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedSettings = getSettings();
      setSettings(updatedSettings);
      
      // 설정된 날짜와 시간을 기반으로 현재 시간 계산
      const baseDate = new Date(updatedSettings.currentDate);
      const [hours, minutes] = updatedSettings.baseTime.split(':');
      const now = new Date();
      
      // 설정된 기준 시간에서 실제 경과 시간을 더함
      const baseDateTime = new Date(baseDate);
      baseDateTime.setHours(parseInt(hours), parseInt(minutes), now.getSeconds(), now.getMilliseconds());
      
      setCurrentTime(baseDateTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
      <Clock className="h-5 w-5 text-blue-600" />
      <span className="text-lg font-semibold text-gray-800">
        {currentTime.toLocaleString('ko-KR')}
      </span>
    </div>
  );
};

export default CurrentTime;