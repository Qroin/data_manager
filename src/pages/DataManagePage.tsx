import React, { useState, useEffect } from 'react';
import { Camera, Save, ArrowLeft, Eye, X } from 'lucide-react';
import { ExcelRow, InspectionData } from '../types';
import { getExcelData, getInspectionData, updateInspectionDataItem, getSettings } from '../utils/localStorage';
import { capturePhoto, generatePhotoPath, savePhotoToStorage, getPhotoFromStorage, deletePhotoFromStorage } from '../utils/photoUtils';

interface DataManagePageProps {
  itemId: string;
  onPageChange: (page: string) => void;
  previousPage: string;
}

const DataManagePage: React.FC<DataManagePageProps> = ({ itemId, onPageChange, previousPage }) => {
  const [itemData, setItemData] = useState<ExcelRow | null>(null);
  const [inspection, setInspection] = useState<InspectionData>({
    id: itemId,
    memo: '',
    judgment: 'No',
    inspectionResult: '',
    date: '',
    photoPath: '',
    createdAt: '',
    updatedAt: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhotoData, setPreviewPhotoData] = useState<string | null>(null);

  useEffect(() => {
    const excelData = getExcelData();
    const item = excelData.find(row => row.id === itemId);
    setItemData(item || null);

    const inspectionData = getInspectionData();
    if (inspectionData[itemId]) {
      setInspection(inspectionData[itemId]);
    } else {
      const settings = getSettings();
      const baseDate = new Date(settings.currentDate);
      const [hours, minutes] = settings.baseTime.split(':');
      const now = new Date();
      
      // 설정된 기준 시간에서 실제 경과 시간을 더함
      const baseDateTime = new Date(baseDate);
      baseDateTime.setHours(parseInt(hours), parseInt(minutes), now.getSeconds(), now.getMilliseconds());
      
      setInspection(prev => ({
        ...prev,
        judgment: 'No',
        date: baseDateTime.toISOString().split('T')[0]
      }));
    }
  }, [itemId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings = getSettings();
      const baseDate = new Date(settings.currentDate);
      const [hours, minutes] = settings.baseTime.split(':');
      const now = new Date();
      
      // 설정된 기준 시간에서 실제 경과 시간을 더함
      const baseDateTime = new Date(baseDate);
      baseDateTime.setHours(parseInt(hours), parseInt(minutes), now.getSeconds(), now.getMilliseconds());
      const timeString = baseDateTime.toISOString();
      
      const updatedInspection: InspectionData = {
        ...inspection,
        updatedAt: timeString,
        createdAt: inspection.createdAt || timeString
      };
      
      updateInspectionDataItem(itemId, updatedInspection);
      alert('데이터가 성공적으로 저장되었습니다.');
      onPageChange(previousPage);
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
    setIsSaving(false);
  };

  const handleCapturePhoto = async () => {
    setIsCapturing(true);
    try {
      const { dataURL, fileName } = await capturePhoto();
      const settings = getSettings();
      const photoPath = generatePhotoPath(settings.currentDate, settings.baseTime);
      
      // 로컬스토리지에 사진 데이터 저장
      savePhotoToStorage(photoPath, dataURL);
      setInspection(prev => ({ ...prev, photoPath }));
      alert('사진이 성공적으로 촬영되었습니다.');
    } catch (error) {
      alert('카메라 접근에 실패했습니다.');
    }
    setIsCapturing(false);
  };

  const handlePhotoPreview = () => {
    if (inspection.photoPath) {
      const photoData = getPhotoFromStorage(inspection.photoPath);
      setPreviewPhotoData(photoData);
      setShowPhotoPreview(true);
    }
  };

  const handleDeletePhoto = () => {
    if (inspection.photoPath) {
      deletePhotoFromStorage(inspection.photoPath);
      setInspection(prev => ({ ...prev, photoPath: '' }));
      setShowPhotoPreview(false);
      setPreviewPhotoData(null);
      alert('사진이 삭제되었습니다.');
    }
  };

  if (!itemData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onPageChange(previousPage)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                돌아가기
              </button>
              <h2 className="text-2xl font-bold text-gray-900">데이터 관리</h2>
              <div></div>
            </div>
          </div>

          {/* 상단 정보 (조밀하게 표현) */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">한전고객번호:</span>
                <p className="text-gray-900 mt-1">{itemData.한전고객번호}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">계기번호:</span>
                <p className="text-gray-900 mt-1">{itemData.계기번호}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">인입주번호:</span>
                <p className="text-gray-900 mt-1">{itemData.인입주번호}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">주소번지:</span>
                <p className="text-gray-900 mt-1">{itemData.주소번지}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">고객명:</span>
                <p className="text-gray-900 mt-1">{itemData.고객명}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">상호:</span>
                <p className="text-gray-900 mt-1">{itemData.상호}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">위치:</span>
                <p className="text-gray-900 mt-1">{itemData.위치}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">대분류:</span>
                <p className="text-gray-900 mt-1">{itemData.대분류}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">소분류:</span>
                <p className="text-gray-900 mt-1">{itemData.소분류}</p>
              </div>
            </div>
          </div>

          {/* 하단 입력 폼 */}
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">점검 정보</h3>
            
            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
              <textarea
                value={inspection.memo}
                onChange={(e) => setInspection(prev => ({ ...prev, memo: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="메모를 입력하세요..."
              />
            </div>

            {/* 점검결과 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">점검결과</label>
              <select
                value={inspection.inspectionResult}
                onChange={(e) => setInspection(prev => ({ ...prev, inspectionResult: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                <option value="적합">적합</option>
                <option value="부적합">부적합</option>
                <option value="부재종결">부재종결</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <input
                type="date"
                value={inspection.date}
                onChange={(e) => setInspection(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 카메라 버튼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사진 촬영</label>
              <div className="flex space-x-3">
                <button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {isCapturing ? '촬영 중...' : '사진 촬영'}
                </button>
                
                {inspection.photoPath && (
                  <button
                    onClick={handlePhotoPreview}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    미리보기
                  </button>
                )}
              </div>
              {inspection.photoPath && (
                <p className="text-sm text-gray-600 mt-2">
                  저장 경로: {inspection.photoPath}
                </p>
              )}
            </div>

            {/* 판정 버튼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">판정</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setInspection(prev => ({ ...prev, judgment: 'Yes' }))}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    inspection.judgment === 'Yes'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setInspection(prev => ({ ...prev, judgment: 'No' }))}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    inspection.judgment === 'No'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 사진 미리보기 모달 */}
        {showPhotoPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">사진 미리보기</h3>
                <button
                  onClick={() => setShowPhotoPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* 사진 경로 및 삭제 버튼 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {inspection.photoPath}
                  </span>
                  <button
                    onClick={handleDeletePhoto}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* 사진 미리보기 */}
                {previewPhotoData && (
                  <div className="text-center">
                    <img
                      src={previewPhotoData}
                      alt="미리보기"
                      className="max-w-full max-h-96 rounded-lg shadow-md mx-auto"
                    />
                  </div>
                )}
                
                {!previewPhotoData && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">사진을 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowPhotoPreview(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManagePage;