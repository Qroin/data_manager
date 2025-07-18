// utils/photoUtils.ts
import { getSimulatedTime } from "./timeUtils";

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
export function generatePhotoPath(): string {
  const simulatedTime = getSimulatedTime();
  return `photos/photo_${simulatedTime.toISOString().replace(/[:.]/g, "-")}.jpg`;
}

export function savePhotoToStorage(photoPath: string, dataURL: string): void {
  try {
    localStorage.setItem(photoPath, dataURL);
  } catch (error) {
    console.error("Error saving photo to localStorage:", error);
  }
}

export function getPhotoFromStorage(photoPath: string): string | null {
  try {
    return localStorage.getItem(photoPath);
  } catch (error) {
    console.error("Error retrieving photo from localStorage:", error);
    return null;
  }
}

export function deletePhotoFromStorage(photoPath: string): void {
  try {
    localStorage.removeItem(photoPath);
  } catch (error) {
    console.error("Error deleting photo from localStorage:", error);
  }
}