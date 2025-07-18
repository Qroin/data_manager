import * as XLSX from 'xlsx';
import { ExcelRow, InspectionData } from '../types';

export const readExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const excelRows: ExcelRow[] = jsonData.map((row: any, index) => ({
          id: `row_${index + 1}`,
          한전고객번호: row['한전고객번호'] || '',
          계기번호: row['계기번호'] || '',
          인입주번호: row['인입주번호'] || '',
          주소번지: row['주소번지'] || '',
          고객명: row['고객명'] || '',
          상호: row['상호'] || '',
          위치: row['위치'] || '',
          대분류: row['대분류'] || '',
          소분류: row['소분류'] || ''
        }));
        
        resolve(excelRows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (excelData: ExcelRow[], inspectionData: Record<string, InspectionData>) => {
  const combinedData = excelData.map(row => {
    const inspection = inspectionData[row.id];
    return {
      ...row,
      메모: inspection?.memo || '',
      판정: inspection?.judgment || '',
      점검결과: inspection?.inspectionResult || '',
      날짜: inspection?.date || '',
      사진저장경로: inspection?.photoPath || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(combinedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '데이터');
  XLSX.writeFile(wb, `백업_데이터_${new Date().toISOString().split('T')[0]}.xlsx`);
};