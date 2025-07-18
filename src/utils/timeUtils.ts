// export function getSimulatedTime(): Date {
//   const settings = getSettings();
//   const baseDate = new Date(settings.currentDate);
//   const [hours, minutes] = settings.baseTime.split(':');
//   const now = new Date();

//   const baseDateTime = new Date(baseDate);
//   baseDateTime.setHours(
//     parseInt(hours),
//     parseInt(minutes),
//     now.getSeconds(),
//     now.getMilliseconds()
//   );

//    return baseDateTime;
// }


import { getSettings } from "./localStorage";

export function getSimulatedTime(): Date {
  const settings = getSettings();
  const { currentDate, baseTime, appStartTime } = settings;

  // currentDate(YYYY-MM-DD)와 baseTime(HH:mm)을 결합
  const baseTimeStr = `${currentDate}T${baseTime}:00`;
  const baseTimeDate = new Date(baseTimeStr);
  const appStartTimeDate = appStartTime ? new Date(appStartTime) : new Date();

  if (isNaN(baseTimeDate.getTime()) || isNaN(appStartTimeDate.getTime())) {
    console.warn("Invalid baseTime or appStartTime, falling back to current time");
    return new Date();
  }

  const now = new Date();
  const elapsedMs = now.getTime() - appStartTimeDate.getTime();
  return new Date(baseTimeDate.getTime() + elapsedMs);
}

export function formatTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}