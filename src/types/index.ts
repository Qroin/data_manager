export interface ExcelRow {
  id: string;
  한전고객번호: string;
  계기번호: string;
  인입주번호: string;
  주소번지: string;
  고객명: string;
  상호: string;
  위치: string;
  대분류: string;
  소분류: string;
}

export interface InspectionData {
  id: string;
  memo: string;
  judgment: 'Yes' | 'No' | '';
  inspectionResult: '적합' | '부적합' | '부재종결' | '기타' | '';
  date: string;
  photoPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  baseTime: string;
  currentDate: string;
}

export type SearchFilter = '계기번호' | '주소' | '전체';