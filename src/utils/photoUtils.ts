export const generatePhotoPath = (baseDate: string, baseTime: string): string => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${baseDate.replace(/-/g, '')}_${timeStr}.jpg`;
};

export const capturePhoto = (): Promise<{ dataURL: string; fileName: string }> => {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        video.srcObject = stream;
        video.play();
        
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context?.drawImage(video, 0, 0);
          
          const dataURL = canvas.toDataURL('image/jpeg');
          const now = new Date();
          const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
          const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
          const fileName = `${dateStr}_${timeStr}.jpg`;
          
          stream.getTracks().forEach(track => track.stop());
          resolve({ dataURL, fileName });
        };
      })
      .catch(reject);
  });
};

// 로컬스토리지에 사진 데이터 저장
export const savePhotoToStorage = (fileName: string, dataURL: string): void => {
  localStorage.setItem(`photo_${fileName}`, dataURL);
};

// 로컬스토리지에서 사진 데이터 가져오기
export const getPhotoFromStorage = (fileName: string): string | null => {
  return localStorage.getItem(`photo_${fileName}`);
};

// 로컬스토리지에서 사진 데이터 삭제
export const deletePhotoFromStorage = (fileName: string): void => {
  localStorage.removeItem(`photo_${fileName}`);
};