import React, { useState, useEffect } from "react";
import { Camera, Save, ArrowLeft, Eye, X } from "lucide-react";
import { ExcelRow, InspectionData } from "../types";
import {
  getExcelData,
  getInspectionData,
  updateInspectionDataItem,
} from "../utils/localStorage";
import {
  capturePhoto,
  generatePhotoPath,
  savePhotoToStorage,
  getPhotoFromStorage,
  deletePhotoFromStorage,
} from "../utils/photoUtils";
import { getSimulatedTime } from "../utils/timeUtils";

interface DataManagePageProps {
  itemId: string;
  onPageChange: (page: string) => void;
  previousPage: string;
}

const DataManagePage: React.FC<DataManagePageProps> = ({
  itemId,
  onPageChange,
  previousPage,
}) => {
  const [itemData, setItemData] = useState<ExcelRow | null>(null);
  const [inspection, setInspection] = useState<InspectionData>(() => {
    const now = getSimulatedTime();
    return {
      id: itemId,
      memo: "",
      judgment: "No",
      inspectionResult: "",
      date: now.toISOString().split("T")[0],
      time: now.toISOString().slice(11, 19),
      photoPath: "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhotoData, setPreviewPhotoData] = useState<string | null>(null);

  useEffect(() => {
    const excelData = getExcelData();
    const item = excelData.find((row) => row.id === itemId);
    setItemData(item || null);

    const inspectionData = getInspectionData();
    if (inspectionData[itemId]) {
      setInspection(inspectionData[itemId]);
    } else {
      const now = getSimulatedTime();
      setInspection({
        id: itemId,
        memo: "",
        judgment: "No",
        inspectionResult: "",
        date: now.toISOString().split("T")[0],
        time: now.toISOString().slice(11, 19),
        photoPath: "",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }
  }, [itemId]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const dateTime = new Date(`${inspection.date}T${inspection.time}`);
      if (isNaN(dateTime.getTime())) {
        alert("유효한 날짜와 시간을 입력해주세요 (형식: YYYY-MM-DD / HH:mm:ss)");
        setIsSaving(false);
        return;
      }

      const now = getSimulatedTime().toISOString();

      const updatedInspection: InspectionData = {
        ...inspection,
        updatedAt: now,
        // createdAt 유지
      };

      updateInspectionDataItem(itemId, updatedInspection);
      alert("데이터가 성공적으로 저장되었습니다.");
      onPageChange(previousPage);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCapturePhoto = async () => {
    setIsCapturing(true);
    try {
      const { dataURL } = await capturePhoto();
      const photoPath = generatePhotoPath();
      savePhotoToStorage(photoPath, dataURL);
      setInspection((prev) => ({ ...prev, photoPath }));
      alert("사진이 성공적으로 촬영되었습니다.");
    } catch (err) {
      alert("카메라 접근에 실패했습니다.");
    } finally {
      setIsCapturing(false);
    }
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
      setInspection((prev) => ({ ...prev, photoPath: "" }));
      setShowPhotoPreview(false);
      setPreviewPhotoData(null);
      alert("사진이 삭제되었습니다.");
    }
  };

  if (!itemData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={() => onPageChange(previousPage)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              돌아가기
            </button>
            <h2 className="text-2xl font-bold text-gray-900">데이터 관리</h2>
            <div />
          </div>

          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <InfoItem label="한전고객번호" value={itemData.한전고객번호} />
              <InfoItem label="계기번호" value={itemData.계기번호} />
              <InfoItem label="인입주번호" value={itemData.인입주번호} />
              <InfoItem label="주소번지" value={itemData.주소번지} />
              <InfoItem label="고객명" value={itemData.고객명} />
              <InfoItem label="상호" value={itemData.상호} />
              <InfoItem label="위치" value={itemData.위치} />
              <InfoItem label="대분류" value={itemData.대분류} />
              <InfoItem label="소분류" value={itemData.소분류} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">점검 정보</h3>

            <div>
              <Label>메모</Label>
              <textarea
                value={inspection.memo}
                onChange={(e) =>
                  setInspection((prev) => ({ ...prev, memo: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="메모를 입력하세요..."
              />
            </div>

            <div>
              <Label>점검결과</Label>
              <select
                value={inspection.inspectionResult}
                onChange={(e) =>
                  setInspection((prev) => ({
                    ...prev,
                    inspectionResult: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">선택하세요</option>
                <option value="적합">적합</option>
                <option value="부적합">부적합</option>
                <option value="부재종결">부재종결</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>날짜</Label>
                <input
                  type="date"
                  value={inspection.date}
                  onChange={(e) =>
                    setInspection((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <Label>시간</Label>
                <input
                  type="text"
                  value={inspection.time}
                  onChange={(e) =>
                    setInspection((prev) => ({ ...prev, time: e.target.value }))
                  }
                  placeholder="HH:mm:ss"
                  pattern="\d{2}:\d{2}:\d{2}"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <Label>사진 촬영</Label>
              <div className="flex space-x-3">
                <button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {isCapturing ? "촬영 중..." : "사진 촬영"}
                </button>
                {inspection.photoPath && (
                  <button
                    onClick={handlePhotoPreview}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

            <div>
              <Label>판정</Label>
              <div className="flex space-x-4">
                <ToggleButton
                  active={inspection.judgment === "Yes"}
                  label="Yes"
                  onClick={() =>
                    setInspection((prev) => ({ ...prev, judgment: "Yes" }))
                  }
                />
                <ToggleButton
                  active={inspection.judgment === "No"}
                  label="No"
                  onClick={() =>
                    setInspection((prev) => ({ ...prev, judgment: "No" }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {showPhotoPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">사진 미리보기</h3>
                <button
                  onClick={() => setShowPhotoPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {previewPhotoData ? (
                <img
                  src={previewPhotoData}
                  alt="미리보기"
                  className="max-w-full max-h-96 rounded-lg shadow-md mx-auto"
                />
              ) : (
                <p className="text-center text-gray-500">사진을 불러올 수 없습니다.</p>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={handleDeletePhoto}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowPhotoPreview(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
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

// 재사용 가능한 소소한 컴포넌트
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="font-medium text-gray-600">{label}:</span>
    <p className="text-gray-900 mt-1">{value}</p>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">{children}</label>
);

const ToggleButton: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
      active
        ? label === "Yes"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {label}
  </button>
);

export default DataManagePage;
