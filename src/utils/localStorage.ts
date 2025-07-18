import { ExcelRow, InspectionData, AppSettings } from '../types';

const EXCEL_DATA_KEY = 'excelData';
const INSPECTION_DATA_KEY = 'inspectionData';
const SETTINGS_KEY = 'appSettings';

export const saveExcelData = (data: ExcelRow[]): void => {
  localStorage.setItem(EXCEL_DATA_KEY, JSON.stringify(data));
};

export const getExcelData = (): ExcelRow[] => {
  const data = localStorage.getItem(EXCEL_DATA_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInspectionData = (data: Record<string, InspectionData>): void => {
  localStorage.setItem(INSPECTION_DATA_KEY, JSON.stringify(data));
};

export const getInspectionData = (): Record<string, InspectionData> => {
  const data = localStorage.getItem(INSPECTION_DATA_KEY);
  return data ? JSON.parse(data) : {};
};

export const updateInspectionDataItem = (id: string, data: InspectionData): void => {
  const allData = getInspectionData();
  allData[id] = data;
  saveInspectionData(allData);
};

// utils/localStorage.ts
export interface TimeSettings {
  currentDate: string; // YYYY-MM-DD
  baseTime: string; // HH:mm
  appStartTime?: string; // ISO 문자열
}

export const saveSettings = (settings: TimeSettings): void => {
  try {
    localStorage.setItem("timeSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings to localStorage:", error);
  }
};

export const getSettings = (): TimeSettings => {
  try {
    const settingsStr = localStorage.getItem("timeSettings");
    return settingsStr
      ? JSON.parse(settingsStr)
      : {
          currentDate: new Date().toISOString().slice(0, 10),
          baseTime: new Date().toISOString().slice(11, 16),
          appStartTime: new Date().toISOString(),
        };
  } catch (error) {
    console.error("Error loading settings from localStorage:", error);
    return {
      currentDate: new Date().toISOString().slice(0, 10),
      baseTime: new Date().toISOString().slice(11, 16),
      appStartTime: new Date().toISOString(),
    };
  }
};
// 초기 appStartTime 설정 (최초 실행 시)
export const initializeAppStartTime = (): void => {
  const settings = getSettings();
  if (!settings.appStartTime) {
    settings.appStartTime = new Date().toISOString();
    saveSettings(settings);
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(EXCEL_DATA_KEY);
  localStorage.removeItem(INSPECTION_DATA_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};