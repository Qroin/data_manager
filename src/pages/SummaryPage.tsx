import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, Eye, ChevronRight } from 'lucide-react';
import { ExcelRow, InspectionData } from '../types';
import { getExcelData, getInspectionData } from '../utils/localStorage';

interface SummaryPageProps {
  onPageChange: (page: string, itemId?: string) => void;
  summaryState: {
    selectedDate: string | null;
  };
  onSummaryStateChange: (selectedDate: string | null) => void;
}

interface DateSummary {
  date: string;
  적합: number;
  부적합: number;
  부재종결: number;
  기타: number;
  yesItems: string[];
  noItems: string[];
}

interface ItemWithInspection {
  item: ExcelRow;
  inspection: InspectionData;
}
const SummaryPage: React.FC<SummaryPageProps> = ({ onPageChange, summaryState, onSummaryStateChange }) => {
  const [dateSummaries, setDateSummaries] = useState<DateSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(summaryState.selectedDate);
  const [selectedYesItems, setSelectedYesItems] = useState<ItemWithInspection[]>([]);
  const [selectedNoItems, setSelectedNoItems] = useState<ItemWithInspection[]>([]);

  useEffect(() => {
    // 상태 변경을 상위 컴포넌트에 알림
    onSummaryStateChange(selectedDate);
  }, [selectedDate, onSummaryStateChange]);
  useEffect(() => {
    const excelData = getExcelData();
    const inspectionData = getInspectionData();

    // 점검결과가 있는 데이터만 필터링
    const inspectionsWithResults = Object.entries(inspectionData).filter(
      ([_, data]) => data.inspectionResult && data.date
    );

    // 날짜별 그룹화
    const dateGroups: Record<string, DateSummary> = {};
    
    inspectionsWithResults.forEach(([itemId, data]) => {
      const date = data.date;
      if (!date) return;

      if (!dateGroups[date]) {
        dateGroups[date] = {
          date,
          적합: 0,
          부적합: 0,
          부재종결: 0,
          기타: 0,
          yesItems: [],
          noItems: []
        };
      }

      // 판정에 따라 분류
      if (data.judgment === 'Yes') {
        dateGroups[date].yesItems.push(itemId);
      } else {
        dateGroups[date].noItems.push(itemId);
      }
      
      // 점검결과 카운트 (판정과 상관없이)
      if (data.inspectionResult) {
        dateGroups[date][data.inspectionResult as keyof Omit<DateSummary, 'date' | 'items'>]++;
      }
    });

    const summaries = Object.values(dateGroups).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setDateSummaries(summaries);
  }, []);

  const handleDateClick = (dateSummary: DateSummary) => {
    setSelectedDate(dateSummary.date);
    const excelData = getExcelData();
    const inspectionData = getInspectionData();
    
    const yesItems = dateSummary.yesItems
      .map(itemId => {
        const item = excelData.find(row => row.id === itemId);
        const inspection = inspectionData[itemId];
        return item && inspection ? { item, inspection } : null;
      })
      .filter((item): item is ItemWithInspection => item !== null)
      .sort((a, b) => {
        // 시간 순서로 정렬 (createdAt 또는 updatedAt 기준)
        const timeA = new Date(a.inspection.updatedAt || a.inspection.createdAt).getTime();
        const timeB = new Date(b.inspection.updatedAt || b.inspection.createdAt).getTime();
        return timeA - timeB;
      });
    
    const noItems = dateSummary.noItems
      .map(itemId => {
        const item = excelData.find(row => row.id === itemId);
        const inspection = inspectionData[itemId];
        return item && inspection ? { item, inspection } : null;
      })
      .filter((item): item is ItemWithInspection => item !== null)
      .sort((a, b) => {
        // 시간 순서로 정렬 (createdAt 또는 updatedAt 기준)
        const timeA = new Date(a.inspection.updatedAt || a.inspection.createdAt).getTime();
        const timeB = new Date(b.inspection.updatedAt || b.inspection.createdAt).getTime();
        return timeA - timeB;
      });
    
    setSelectedYesItems(yesItems);
    setSelectedNoItems(noItems);
  };

  const handleItemClick = (itemId: string) => {
    onPageChange('manage', itemId);
  };

  const getInspectionResultColor = (result: string) => {
    switch (result) {
      case '적합':
        return 'text-green-600 bg-green-50 border-green-200';
      case '부적합':
        return 'text-red-600 bg-red-50 border-red-200';
      case '부재종결':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case '기타':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            점검 결과 조회
          </h2>

          {dateSummaries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">점검결과가 있는 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 날짜별 요약 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">날짜별 요약</h3>
                <div className="space-y-3">
                  {dateSummaries.map((summary) => (
                    <div
                      key={summary.date}
                      onClick={() => handleDateClick(summary)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDate === summary.date
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {new Date(summary.date).toLocaleDateString('ko-KR')}
                        </h4>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">적합:</span>
                          <span className="font-medium">{summary.적합}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">부적합:</span>
                          <span className="font-medium">{summary.부적합}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">부재종결:</span>
                          <span className="font-medium">{summary.부재종결}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">기타:</span>
                          <span className="font-medium">{summary.기타}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 판정 Yes 항목 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate ? `판정 Yes (${selectedYesItems.length}건)` : '날짜를 선택하세요'}
                </h3>
                
                {selectedDate ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedYesItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">판정 Yes 항목이 없습니다.</p>
                    ) : (
                      selectedYesItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className="p-3 border border-green-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-green-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.고객명}</p>
                              <p className="text-sm text-gray-600">{item.계기번호}</p>
                              <p className="text-sm text-gray-600">{item.주소번지}</p>
                            </div>
                            <Eye className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">날짜를 선택하면 판정 Yes 항목을 확인할 수 있습니다.</p>
                  </div>
                )}
              </div>

              {/* 판정 No 항목 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate ? `판정 No (${selectedNoItems.length}건)` : '날짜를 선택하세요'}
                </h3>
                
                {selectedDate ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedNoItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">판정 No 항목이 없습니다.</p>
                    ) : (
                      selectedNoItems.map((item) => (
                      <div
                          className="p-3 border border-red-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-red-50"
                        onClick={() => handleItemClick(item.id)}
                        className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.고객명}</p>
                            <p className="text-sm text-gray-600">{item.계기번호}</p>
                            <Eye className="h-4 w-4 text-red-600" />
                          </div>
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">날짜를 선택하면 판정 No 항목을 확인할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;