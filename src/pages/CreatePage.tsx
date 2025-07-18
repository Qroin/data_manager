import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { ExcelRow } from '../types';
import { getExcelData, saveExcelData } from '../utils/localStorage';

interface CreatePageProps {
  onPageChange: (page: string, itemId?: string) => void;
}

const CreatePage: React.FC<CreatePageProps> = ({ onPageChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ExcelRow, 'id'>>({
    한전고객번호: '',
    계기번호: '',
    인입주번호: '',
    주소번지: '',
    고객명: '',
    상호: '',
    위치: '',
    대분류: '',
    소분류: ''
  });

  const handleCreateNew = () => {
    const existingData = getExcelData();
    const newId = `new_${Date.now()}`;
    const newRow: ExcelRow = {
      ...newItem,
      id: newId
    };
    
    const updatedData = [...existingData, newRow];
    saveExcelData(updatedData);
    
    alert('새 항목이 생성되었습니다.');
    onPageChange('manage', newId);
  };

  const isFormValid = Object.values(newItem).some(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">새 항목 생성</h2>
          
          {!showForm ? (
            <div className="text-center py-12">
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                새 항목 만들기 +
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    한전고객번호
                  </label>
                  <input
                    type="text"
                    value={newItem.한전고객번호}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 한전고객번호: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    계기번호
                  </label>
                  <input
                    type="text"
                    value={newItem.계기번호}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 계기번호: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인입주번호
                  </label>
                  <input
                    type="text"
                    value={newItem.인입주번호}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 인입주번호: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소번지
                  </label>
                  <input
                    type="text"
                    value={newItem.주소번지}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 주소번지: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고객명
                  </label>
                  <input
                    type="text"
                    value={newItem.고객명}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 고객명: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상호
                  </label>
                  <input
                    type="text"
                    value={newItem.상호}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 상호: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위치
                  </label>
                  <input
                    type="text"
                    value={newItem.위치}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 위치: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대분류
                  </label>
                  <input
                    type="text"
                    value={newItem.대분류}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 대분류: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    소분류
                  </label>
                  <input
                    type="text"
                    value={newItem.소분류}
                    onChange={(e) => setNewItem(prev => ({ ...prev, 소분류: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleCreateNew}
                  disabled={!isFormValid}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5 mr-2" />
                  생성 및 관리하기
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;