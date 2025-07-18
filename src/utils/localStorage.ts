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

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { baseTime: '09:00', currentDate: new Date().toISOString().split('T')[0] };
};

export const clearAllData = (): void => {
  localStorage.removeItem(EXCEL_DATA_KEY);
  localStorage.removeItem(INSPECTION_DATA_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};