import React, { useState, useEffect } from "react";
import { Upload, Trash2, Download, Settings, Clock } from "lucide-react";
import { readExcelFile, exportToExcel } from "../utils/excelUtils";
import { saveExcelData, getExcelData, getInspectionData, clearAllData, saveSettings, getSettings, initializeAppStartTime } from "../utils/localStorage";
import CurrentTime from "../components/CurrentTime";

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedSettings = getSettings();
    return {
      currentDate: savedSettings.currentDate || new Date().toISOString().slice(0, 10),
      baseTime: savedSettings.baseTime || new Date().toISOString().slice(11, 16),
      appStartTime: savedSettings.appStartTime || new Date().toISOString(),
    };
  });

  // 앱 시작 시 appStartTime 초기화
  useEffect(() => {
    initializeAppStartTime();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await readExcelFile(file);
      saveExcelData(data);
      alert(`성공적으로 ${data.length}개의 데이터를 불러왔습니다.`);
      onPageChange("search");
    } catch (error) {
      alert("파일 읽기에 실패했습니다. 올바른 엑셀 파일인지 확인해주세요.");
    }
    setIsLoading(false);
  };

  const handleDeleteData = () => {
    clearAllData();
    setShowDeleteConfirm(false);
    alert("모든 데이터가 삭제되었습니다.");
  };

  const handleExportData = () => {
    const excelData = getExcelData();
    const inspectionData = getInspectionData();
    exportToExcel(excelData, inspectionData);
    setShowExportConfirm(false);
    alert("엑셀 파일로 백업이 완료되었습니다.");
  };

  const handleSaveSettings = () => {
    const newBaseTime = new Date(`${settings.currentDate}T${settings.baseTime}:00`);
    if (isNaN(newBaseTime.getTime())) {
      alert("유효한 날짜와 시간을 입력해주세요.");
      return;
    }
    saveSettings({ ...settings, baseTime: settings.baseTime, currentDate: settings.currentDate });
    setShowSettings(false);
    alert("설정이 저장되었습니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <CurrentTime />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            데이터 관리 시스템
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 엑셀 파일 업로드 */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
              <label className="cursor-pointer block text-center">
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <span className="text-lg font-semibold text-blue-700 mb-2 block">
                  엑셀 파일 업로드
                </span>
                <span className="text-sm text-blue-600">
                  .xlsx, .xls 파일을 선택하세요
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="text-sm text-blue-600 mt-2 block">처리 중...</span>
                </div>
              )}
            </div>

            {/* 설정 */}
            <div className="space-y-4">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-5 w-5 mr-2" />
                날짜 및 시간 설정
              </button>

              <button
                onClick={() => setShowExportConfirm(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                엑셀 백업 저장
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                데이터 로그 삭제
              </button>
            </div>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">데이터 삭제 확인</h3>
              <p className="text-gray-600 mb-6">
                정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteData}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 내보내기 확인 모달 */}
        {showExportConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">엑셀 백업 저장</h3>
              <p className="text-gray-600 mb-6">
                현재 데이터를 엑셀 파일로 저장하시겠습니까?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleExportData}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 설정 모달 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">날짜 및 시간 설정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기준 날짜
                  </label>
                  <input
                    type="date"
                    value={settings.currentDate}
                    onChange={(e) => setSettings({ ...settings, currentDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기준 시간
                  </label>
                  <input
                    type="time"
                    value={settings.baseTime}
                    onChange={(e) => setSettings({ ...settings, baseTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;