// photoUtils.ts

/**
 * 파일명 생성
 */
export const generatePhotoPath = (baseDate: string, baseTime: string): string => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${baseDate.replace(/-/g, '')}_${timeStr}.jpg`;
};

/**
 * 사진 캡처 (캡처 후 DataURL + 파일명 반환)
 */
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

/**
 * IndexedDB 열기
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PhotoDB', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'fileName' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * 사진 IndexedDB에 저장 (Blob)
 */
export const savePhotoToStorage = async (fileName: string, dataURL: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');

  // DataURL → Blob 변환
  const blob = dataURLtoBlob(dataURL);

  store.put({ fileName, blob });

  await tx.done;
  db.close();
};

/**
 * 사진 IndexedDB에서 가져오기 (Blob 반환)
 */
export const getPhotoFromStorage = async (fileName: string): Promise<Blob | null> => {
  const db = await openDB();
  const tx = db.transaction('photos', 'readonly');
  const store = tx.objectStore('photos');

  const result = await new Promise<any>((resolve, reject) => {
    const request = store.get(fileName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return result ? result.blob : null;
};

/**
 * 사진 IndexedDB에서 삭제
 */
export const deletePhotoFromStorage = async (fileName: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');

  store.delete(fileName);

  await tx.done;
  db.close();
};

/**
 * 사진을 로컬로 다운로드 (Blob → 파일 저장)
 */
export const downloadPhoto = async (fileName: string): Promise<void> => {
  const blob = await getPhotoFromStorage(fileName);
  if (!blob) {
    console.error('사진이 존재하지 않습니다.');
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * DataURL → Blob 변환 유틸
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
