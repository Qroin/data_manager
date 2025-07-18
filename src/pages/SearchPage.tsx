import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink } from 'lucide-react';
import { ExcelRow, SearchFilter } from '../types';
import { getExcelData } from '../utils/localStorage';

interface SearchPageProps {
  onPageChange: (page: string, itemId?: string) => void;
  searchState: {
    searchTerm: string;
    searchFilter: string;
  };
  onSearchStateChange: (searchTerm: string, searchFilter: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onPageChange, searchState, onSearchStateChange }) => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchState.searchTerm);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>(searchState.searchFilter as SearchFilter);

  useEffect(() => {
    const data = getExcelData();
    setExcelData(data);
    setFilteredData(data);
  }, []);

  useEffect(() => {
    // 상태 변경을 상위 컴포넌트에 알림
    onSearchStateChange(searchTerm, searchFilter);
  }, [searchTerm, searchFilter, onSearchStateChange]);
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(excelData);
      return;
    }

    const filtered = excelData.filter(row => {
      const searchLower = searchTerm.toLowerCase();
      
      switch (searchFilter) {
        case '계기번호':
          return row.계기번호.toLowerCase().includes(searchLower);
        case '주소':
          return row.주소번지.toLowerCase().includes(searchLower);
        case '전체':
        default:
          return Object.values(row).some(value => 
            value.toString().toLowerCase().includes(searchLower)
          );
      }
    });
    
    setFilteredData(filtered);
  }, [searchTerm, searchFilter, excelData]);

  const handleItemClick = (itemId: string) => {
    onPageChange('manage', itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">데이터 검색</h2>
          
          {/* 검색 필터 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value as SearchFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="전체">전체</option>
                <option value="계기번호">계기번호</option>
                <option value="주소">주소</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                총 {filteredData.length}개의 항목이 검색되었습니다.
              </p>
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredData.map((row) => (
                  <div
                    key={row.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleItemClick(row.id)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">계기번호:</span>
                        <p className="text-gray-900">{row.계기번호}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">고객명:</span>
                        <p className="text-gray-900">{row.고객명}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">주소:</span>
                        <p className="text-gray-900">{row.주소번지}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-700">상호:</span>
                          <p className="text-gray-900">{row.상호}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;